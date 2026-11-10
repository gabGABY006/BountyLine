# MongoDB

Contenido social de BountyLine (supuestos S6 y S80 a S85). Corre en su propia máquina virtual, `BountyLine-MongoDB` (Ubuntu Server 26.04 LTS, MongoDB 8.0 con el paquete oficial publicado para Ubuntu 24.04).

| Colección | Contenido | Índices |
| :--- | :--- | :--- |
| `publicaciones` | Publicaciones del feed con sus comentarios y reacciones embebidos | fecha, etiquetas, zona, autor, misión, id de comentario y texto completo |
| `mensajes_chat` | Un documento por mensaje del chat entre el usuario y el cazarrecompensas asignado | misión + fecha, emisor |
| `bitacora_actividad` | Eventos de uso: inicios de sesión, búsquedas con sus filtros y vistas de misiones o perfiles | cuenta + fecha, tipo + fecha |

Cada colección tiene un validador `$jsonSchema`. Los documentos guardan el `id_cuenta` y el `id_mision` de MySQL; la aplicación comprueba que existan antes de escribir (S85).

## Scripts

1. `01_colecciones.js`: base `bountyline`, colecciones, validadores e índices.
2. `02_insercion.js`: datos de prueba coherentes con los de MySQL (28 publicaciones, 96 mensajes, 160 eventos). Incluye la publicación y el comentario que aparecen en la tabla `reporte`.
3. `03_usuarios.js`: usuarios `bountyline_admin` (root) y `bountyline_app` (lectura y escritura en `bountyline`).
4. `04_consultas.js`: CRUD, consultas con filtros y proyección, y agregaciones (etiquetas por zona, publicaciones por semana, promedio de mensajes por misión, filtros más usados y un `$lookup`).

Los tres primeros los ejecuta el instalador de la VM antes de activar la autenticación.

## Conexión desde Windows

| Qué | Valor |
| :--- | :--- |
| Servidor | `127.0.0.1:27018` |
| Aplicación | `mongodb://bountyline_app:BountyApp2026*@127.0.0.1:27018/bountyline?authSource=admin` |
| Administrador | `mongodb://bountyline_admin:BountyAdmin2026*@127.0.0.1:27018/?authSource=admin` |

Con MongoDB Compass basta pegar la cadena del administrador.

## Instalación en la VM

`instalar-vm.sh` instala MongoDB 8.0 desde el repositorio oficial, ejecuta los tres primeros scripts, abre conexiones remotas (`bindIp 0.0.0.0`) y activa la autenticación. Se ejecuta dentro de la VM con `sudo bash instalar-vm.sh` desde esta carpeta; si se vuelve a ejecutar, recarga la base desde cero.

En VirtualBox la VM redirige `127.0.0.1:27018` de Windows al puerto 27017 de MongoDB y `127.0.0.1:2223` al SSH.
