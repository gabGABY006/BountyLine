# Máquina virtual de la base de datos relacional

La VM `BountyLine-MySQL` corre Ubuntu Server 24.04 LTS con MySQL 8.0 en VirtualBox. Se crea con un solo comando y queda con la base `bountyline` cargada (creación, lógica, datos de prueba y usuarios).

## Requisitos

- VirtualBox 7 instalado en Windows.
- Conexión a internet (descarga unos 600 MB la primera vez).
- 2 GB de RAM libres y 20 GB de disco.

## Crear la VM

Desde la raíz del repositorio, en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\bd\vm\crear-vm.ps1
```

El script descarga la imagen oficial de Ubuntu Server para la nube, crea la VM, le pasa una configuración cloud-init y espera a que termine. Tarda entre 5 y 15 minutos. Para borrarla y crearla otra vez:

```powershell
powershell -ExecutionPolicy Bypass -File .\bd\vm\crear-vm.ps1 -Recrear
```

## Datos de conexión

| Qué | Valor |
| :--- | :--- |
| MySQL desde Windows | `127.0.0.1:3307` |
| Base de datos | `bountyline` |
| Usuario de la aplicación | `bountyline_app` / `BountyApp2026*` |
| Usuario administrador | `bountyline_admin` / `BountyAdmin2026*` |
| SSH | `ssh -p 2222 bountyline@127.0.0.1` (clave `BountyVM2026*`) |

El puerto 3307 de Windows se redirige al 3306 de la VM por NAT, así que no choca con un MySQL instalado en el propio equipo.

## Qué hace cloud-init dentro de la VM

1. Crea el usuario del sistema `bountyline` con sudo.
2. Instala `mysql-server` y lo configura para escuchar conexiones remotas (`/etc/mysql/mysql.conf.d/99-bountyline.cnf`).
3. Ejecuta en orden `01_creacion.sql`, `02_logica.sql`, `03_insercion.sql` y `04_usuarios.sql`. La salida queda en `/var/log/bountyline-sql.log`.

## Comandos útiles

```powershell
$vbox = "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
& $vbox startvm BountyLine-MySQL --type headless   # encender
& $vbox controlvm BountyLine-MySQL acpipowerbutton  # apagar
```

Para recargar la base desde cero dentro de la VM:

```bash
cd /opt/bountyline/sql && for f in 0*.sql; do sudo mysql < "$f"; done
```
