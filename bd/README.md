# Base de datos

| Carpeta | Contenido |
| :--- | :--- |
| `mysql` | Scripts de MySQL en orden de ejecución |

## Scripts de MySQL

1. `01_creacion.sql`: base `bountyline`, 14 tablas, llaves, restricciones `CHECK` e índices.
2. `02_logica.sql`: 4 funciones, 24 procedimientos almacenados, 14 triggers y 3 vistas (`v_mision_detalle`, `v_cazarrecompensas_perfil` y `v_bitacora`).
3. `03_insercion.sql`: datos de prueba cargados mediante los procedimientos (24 cuentas, 24 misiones, postulaciones, movimientos, calificaciones, reportes).
4. `04_usuarios.sql`: usuarios `bountyline_app` (consulta y ejecución) y `bountyline_admin`.

Los comentarios `Sxx` remiten al documento de supuestos.
