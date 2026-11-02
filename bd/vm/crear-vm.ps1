<#
.SYNOPSIS
  Crea la máquina virtual de la base de datos relacional de BountyLine.

.DESCRIPTION
  - Descarga la imagen oficial de Ubuntu Server 24.04 LTS para la nube (cloud image).
  - Crea una VM en VirtualBox con 2 CPU, 2 GB de RAM y disco de 20 GB.
  - Le entrega una configuración cloud-init que crea el usuario del sistema,
    instala MySQL 8.0, abre el acceso remoto y carga los scripts de bd/mysql.
  - Redirige puertos del equipo anfitrión a la VM:
        127.0.0.1:3307 -> MySQL de la VM (3306)
        127.0.0.1:2222 -> SSH de la VM (22)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\bd\vm\crear-vm.ps1
  powershell -ExecutionPolicy Bypass -File .\bd\vm\crear-vm.ps1 -Recrear
#>
param(
    [string]$NombreVM    = 'BountyLine-MySQL',
    [int]   $MemoriaMB   = 2048,
    [int]   $Cpus        = 2,
    [int]   $DiscoGB     = 20,
    [int]   $PuertoMySQL = 3307,
    [int]   $PuertoSSH   = 2222,
    [switch]$Recrear
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'   # acelera Invoke-WebRequest
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$UrlImagen    = 'https://cloud-images.ubuntu.com/releases/noble/release/ubuntu-24.04-server-cloudimg-amd64.vmdk'
$UsuarioSO    = 'bountyline'
$ClaveSO      = 'BountyVM2026*'
$CarpetaSQL   = Join-Path $PSScriptRoot '..\mysql' | Resolve-Path
$CarpetaVMs   = Join-Path $env:USERPROFILE 'VirtualBox VMs'
$Recursos     = Join-Path $CarpetaVMs "$NombreVM-recursos"
$ImagenBase   = Join-Path $Recursos 'ubuntu-24.04-server-cloudimg-amd64.vmdk'
$Disco        = Join-Path $Recursos "$NombreVM.vdi"
$Semilla      = Join-Path $Recursos 'cloud-init-seed.iso'
$LogSerial    = Join-Path $Recursos 'consola-serial.log'

function Paso($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

# ---------------------------------------------------------------------
# VBoxManage
# ---------------------------------------------------------------------
$candidatos = @()
if ($env:VBOX_MSI_INSTALL_PATH) { $candidatos += (Join-Path $env:VBOX_MSI_INSTALL_PATH 'VBoxManage.exe') }
$candidatos += 'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe'
$VBox = $candidatos | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $VBox) { throw 'No se encontró VBoxManage.exe. Instale VirtualBox o agréguelo al PATH.' }
function VBox { & $VBox @args; if ($LASTEXITCODE -ne 0) { throw "VBoxManage $($args -join ' ') falló." } }
Write-Host "VirtualBox: $(& $VBox --version)"

# ---------------------------------------------------------------------
# VM existente
# ---------------------------------------------------------------------
$existe = (& $VBox list vms) -match "^`"$([regex]::Escape($NombreVM))`""
if ($existe) {
    if (-not $Recrear) { throw "La VM '$NombreVM' ya existe. Use -Recrear para borrarla y crearla de nuevo." }
    Paso "Eliminando la VM anterior"
    & $VBox controlvm $NombreVM poweroff 2>$null | Out-Null
    Start-Sleep -Seconds 3
    VBox unregistervm $NombreVM --delete
}
New-Item -ItemType Directory -Force -Path $Recursos | Out-Null
if (Test-Path $Disco)     { & $VBox closemedium disk $Disco --delete 2>$null | Out-Null; Remove-Item $Disco -Force -ErrorAction SilentlyContinue }
if (Test-Path $Semilla)   { & $VBox closemedium dvd $Semilla 2>$null | Out-Null; Remove-Item $Semilla -Force }
if (Test-Path $LogSerial) { Remove-Item $LogSerial -Force }

# ---------------------------------------------------------------------
# Imagen de Ubuntu Server 24.04
# ---------------------------------------------------------------------
if (-not (Test-Path $ImagenBase)) {
    Paso "Descargando Ubuntu Server 24.04 LTS (cloud image, unos 600 MB)"
    Invoke-WebRequest -Uri $UrlImagen -OutFile "$ImagenBase.part" -UseBasicParsing
    Move-Item "$ImagenBase.part" $ImagenBase
} else {
    Write-Host "Imagen ya descargada: $ImagenBase"
}

Paso "Creando el disco de $DiscoGB GB"
VBox clonemedium disk $ImagenBase $Disco --format VDI | Out-Null
VBox modifymedium disk $Disco --resize ($DiscoGB * 1024) | Out-Null

# ---------------------------------------------------------------------
# cloud-init (NoCloud): user-data con los scripts SQL embebidos
# ---------------------------------------------------------------------
Paso "Preparando la configuración cloud-init"
$archivosSQL = Get-ChildItem $CarpetaSQL -Filter '0*.sql' | Sort-Object Name
if ($archivosSQL.Count -eq 0) { throw "No hay scripts SQL en $CarpetaSQL" }

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append(@"
#cloud-config
hostname: bountyline-mysql
timezone: America/Bogota
users:
  - name: $UsuarioSO
    gecos: Administrador BountyLine
    groups: [sudo]
    shell: /bin/bash
    sudo: "ALL=(ALL) NOPASSWD:ALL"
    lock_passwd: false
    plain_text_passwd: "$ClaveSO"
ssh_pwauth: true
package_update: true
packages:
  - mysql-server
write_files:
  - path: /etc/mysql/mysql.conf.d/99-bountyline.cnf
    content: |
      [mysqld]
      bind-address = 0.0.0.0
      character-set-server = utf8mb4
      collation-server = utf8mb4_0900_ai_ci
      default-time-zone = '-05:00'

"@)
foreach ($f in $archivosSQL) {
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($f.FullName))
    [void]$sb.Append("  - path: /opt/bountyline/sql/$($f.Name)`n    encoding: b64`n    content: $b64`n")
}
[void]$sb.Append(@'
runcmd:
  - [bash, -c, "sed -i 's/\\r$//' /opt/bountyline/sql/*.sql"]
  - [systemctl, restart, mysql]
  - [bash, -c, "for f in /opt/bountyline/sql/0*.sql; do echo \"== $f\" >> /var/log/bountyline-sql.log; mysql < \"$f\" >> /var/log/bountyline-sql.log 2>&1 || echo \"BOUNTYLINE_ERROR_SQL $f\" > /dev/ttyS0; done"]
final_message: "BOUNTYLINE_LISTO cloud-init termino en $UPTIME segundos"

'@)
$userData = $sb.ToString() -replace "`r`n", "`n"
$metaData = "instance-id: $NombreVM-$(Get-Date -Format yyyyMMddHHmmss)`nlocal-hostname: bountyline-mysql`n"

$carpetaSemilla = Join-Path $Recursos 'seed'
if (Test-Path $carpetaSemilla) { Remove-Item $carpetaSemilla -Recurse -Force }
New-Item -ItemType Directory -Path $carpetaSemilla | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText((Join-Path $carpetaSemilla 'user-data'), $userData, $utf8)
[IO.File]::WriteAllText((Join-Path $carpetaSemilla 'meta-data'), $metaData, $utf8)

# ISO con etiqueta "cidata" usando IMAPI2 (incluido en Windows)
if (-not ('BountyIso' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
public static class BountyIso {
    public static void Guardar(string ruta, object flujo, int bloque, int bloques) {
        IStream entrada = (IStream)flujo;
        byte[] buffer = new byte[bloque];
        IntPtr leidos = Marshal.AllocHGlobal(4);
        try {
            using (FileStream salida = File.Create(ruta)) {
                while (bloques-- > 0) {
                    entrada.Read(buffer, bloque, leidos);
                    salida.Write(buffer, 0, Marshal.ReadInt32(leidos));
                }
            }
        } finally { Marshal.FreeHGlobal(leidos); }
    }
}
'@
}
$fsi = New-Object -ComObject IMAPI2FS.MsftFileSystemImage
$fsi.FileSystemsToCreate = 3          # ISO9660 + Joliet
$fsi.VolumeName = 'cidata'
$fsi.Root.AddTree($carpetaSemilla, $false)
$imagen = $fsi.CreateResultImage()
[BountyIso]::Guardar($Semilla, $imagen.ImageStream, $imagen.BlockSize, $imagen.TotalBlocks)

# ---------------------------------------------------------------------
# Máquina virtual
# ---------------------------------------------------------------------
Paso "Creando la VM '$NombreVM'"
VBox createvm --name $NombreVM --ostype Ubuntu_64 --register | Out-Null
VBox modifyvm $NombreVM --memory $MemoriaMB --cpus $Cpus --ioapic on `
    --graphicscontroller vmsvga --vram 16 `
    --nic1 nat `
    --natpf1 "mysql,tcp,127.0.0.1,$PuertoMySQL,,3306" `
    --natpf1 "ssh,tcp,127.0.0.1,$PuertoSSH,,22" `
    --uart1 0x3F8 4 --uartmode1 file $LogSerial
VBox storagectl $NombreVM --name SATA --add sata --controller IntelAhci --portcount 2
VBox storageattach $NombreVM --storagectl SATA --port 0 --device 0 --type hdd --medium $Disco
VBox storageattach $NombreVM --storagectl SATA --port 1 --device 0 --type dvddrive --medium $Semilla

Paso "Encendiendo la VM sin ventana (headless)"
VBox startvm $NombreVM --type headless | Out-Null

# ---------------------------------------------------------------------
# Esperar a que cloud-init termine (lo anuncia por la consola serial)
# ---------------------------------------------------------------------
Paso "Instalando Ubuntu y MySQL dentro de la VM (5 a 15 minutos)"
$limite = (Get-Date).AddMinutes(25)
$listo = $false
while ((Get-Date) -lt $limite) {
    Start-Sleep -Seconds 15
    if (Test-Path $LogSerial) {
        $fs = [IO.File]::Open($LogSerial, 'Open', 'Read', 'ReadWrite')
        $texto = (New-Object IO.StreamReader($fs)).ReadToEnd(); $fs.Close()
        if ($texto -match 'BOUNTYLINE_ERROR_SQL (\S+)') { Write-Warning "Falló el script $($Matches[1]). Revise /var/log/bountyline-sql.log en la VM." }
        if ($texto -match 'BOUNTYLINE_LISTO') { $listo = $true; break }
    }
    Write-Host -NoNewline '.'
}
Write-Host ''
if (-not $listo) { throw "La VM no terminó a tiempo. Revise $LogSerial" }

Paso "Listo"
Write-Host @"
VM ............ $NombreVM (Ubuntu Server 24.04 LTS, MySQL 8.0)
MySQL ......... 127.0.0.1:$PuertoMySQL  base: bountyline
   aplicación . bountyline_app   / BountyApp2026*
   admin ...... bountyline_admin / BountyAdmin2026*
SSH ........... ssh -p $PuertoSSH $UsuarioSO@127.0.0.1   (clave: $ClaveSO)
Consola serial  $LogSerial

Apagar:   & "$VBox" controlvm $NombreVM acpipowerbutton
Encender: & "$VBox" startvm $NombreVM --type headless
"@
