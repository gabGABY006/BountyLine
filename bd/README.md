# Base de datos

| Carpeta | Contenido |
| :--- | :--- |
| `mysql` | Scripts de MySQL en orden de ejecución |
| `vm` | Creación de la máquina virtual con Ubuntu Server y MySQL |

## Scripts de MySQL

1. `01_creacion.sql`: base `bountyline`, 14 tablas, llaves, restricciones `CHECK` e índices.
2. `02_logica.sql`: 4 funciones, 15 procedimientos almacenados, 14 triggers y 2 vistas.
3. `03_insercion.sql`: datos de prueba cargados mediante los procedimientos (24 cuentas, 24 misiones, postulaciones, movimientos, calificaciones, reportes).
4. `04_usuarios.sql`: usuarios `bountyline_app` (consulta y ejecución) y `bountyline_admin`.

Los comentarios `Sxx` remiten al documento de supuestos.
