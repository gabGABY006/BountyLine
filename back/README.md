# BountyLine API (Spring Boot)

API REST de la parte relacional del proyecto. Se conecta a MySQL en la máquina virtual y ejecuta la lógica de negocio a través de los procedimientos almacenados de `bd/mysql/02_logica.sql`.

## Requisitos

- JDK 21.
- Maven no es necesario: el proyecto trae el wrapper `mvnw`.
- La máquina virtual con MySQL encendida. Por defecto la API busca MySQL en `127.0.0.1:3307`; si la VM usa otra dirección o puerto, cámbielo con `DB_URL`.

## Ejecutar

```powershell
cd back
.\mvnw spring-boot:run
```

En Spring Tool Suite: *File > Import > Existing Maven Projects*, elegir la carpeta `back` y ejecutar `BountylineApplication` como *Spring Boot App*.

La conexión se puede cambiar con variables de entorno: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT` y `CORS_ORIGEN`.

Prueba rápida: <http://localhost:8080/api/salud>

## Estructura

Cada clase del modelo tiene su DTO, repositorio, servicio y controlador.

| Paquete | Contenido |
| :--- | :--- |
| `model` | Una clase por cada tabla de la base de datos |
| `dto` | Objetos de respuesta y de entrada de la API (records) |
| `repository` | Consultas a tablas y vistas, y llamadas a los procedimientos almacenados |
| `service` | Reglas de la aplicación (hash de contraseñas, inicio de sesión, validaciones) y conversión a DTO |
| `controller` | Endpoints REST |
| `exception` | Manejo de errores: los `SIGNAL SQLSTATE '45000'` de MySQL llegan al cliente como 400 con su mensaje |

El usuario de base de datos `bountyline_app` solo puede consultar y ejecutar procedimientos, así que toda escritura pasa por la lógica de la base.

## Endpoints

| Entidad | Método y ruta | Procedimiento o vista |
| :--- | :--- | :--- |
| Cuenta | `GET /api/cuentas?rol=&estado=` · `GET /api/cuentas/{id}` | |
| | `POST /api/cuentas/registro` | `sp_registrar_cuenta` |
| | `POST /api/cuentas/login` | |
| | `PUT /api/cuentas/{id}/correo` | `sp_cambiar_correo` |
| | `PUT /api/cuentas/{id}/estado` | `sp_cambiar_estado_cuenta` |
| Usuario | `GET /api/usuarios` · `GET /api/usuarios/{id}` | |
| | `PUT /api/usuarios/{id}` | `sp_actualizar_usuario` |
| Cazarrecompensas | `GET /api/cazarrecompensas?idZona=&disponibilidad=` · `GET /api/cazarrecompensas/{id}` | `v_cazarrecompensas_perfil` |
| | `PUT /api/cazarrecompensas/{id}` | `sp_actualizar_cazarrecompensas` |
| CazarrecompensasEspecialidad | `GET /api/cazarrecompensas/{id}/especialidades` | |
| | `POST /api/cazarrecompensas/{id}/especialidades` | `sp_guardar_especialidad_caz` |
| | `DELETE /api/cazarrecompensas/{id}/especialidades/{idEspecialidad}` | `sp_quitar_especialidad_caz` |
| Administrador | `GET /api/administradores` · `GET /api/administradores/{id}` | |
| Billetera | `GET /api/billeteras/{idCuenta}` | |
| | `POST /api/billeteras/{idCuenta}/recargas` | `sp_recargar_saldo` |
| Movimiento | `GET /api/movimientos?idCuenta=&idMision=&limite=` | |
| Zona | `GET /api/zonas` · `GET /api/zonas/{id}` | |
| | `POST /api/zonas` · `PUT /api/zonas/{id}` | `sp_crear_zona` · `sp_actualizar_zona` |
| Especialidad | `GET /api/especialidades` · `GET /api/especialidades/{id}` | |
| | `POST /api/especialidades` · `PUT /api/especialidades/{id}` | `sp_crear_especialidad` · `sp_actualizar_especialidad` |
| Misión | `GET /api/misiones?estado=&idUsuario=&idCazarrecompensas=` · `GET /api/misiones/{id}` | `v_mision_detalle` |
| | `POST /api/misiones` | `sp_publicar_mision` |
| | `GET /api/misiones/{id}/sugerencias?limite=5` | `sp_sugerir_cazarrecompensas` |
| | `POST /api/misiones/{id}/asignacion` | `sp_asignar_cazarrecompensas` |
| | `POST /api/misiones/{id}/inicio` | `sp_iniciar_mision` |
| | `POST /api/misiones/{id}/cierre` | `sp_cerrar_mision` |
| | `POST /api/misiones/{id}/cancelacion` | `sp_cancelar_mision` |
| Postulación | `GET /api/postulaciones?idMision=&idCazarrecompensas=` | `fn_puntaje_match` |
| | `POST /api/postulaciones` | `sp_postular` |
| Calificación | `GET /api/calificaciones?idMision=&idCazarrecompensas=` | |
| | `POST /api/calificaciones` | `sp_calificar_mision` |
| Reporte | `GET /api/reportes?estado=` · `GET /api/reportes/{id}` | |
| | `POST /api/reportes` | `sp_crear_reporte` |
| | `POST /api/reportes/{id}/resolucion` | `sp_resolver_reporte` |
| AuditoriaCuenta | `GET /api/auditoria-cuentas?idCuenta=` | |
| | `GET /api/salud` | Prueba de conexión |

Los movimientos y la auditoría solo se consultan: los crean los procedimientos y los triggers, y la base no deja modificarlos.

Cuentas de prueba (contraseña `BountyLine2026*`): `axiom_47@bountyline.gg` (usuario), `vanta_k@bountyline.gg` (cazarrecompensas), `admin@bountyline.gg` (administrador).

Por ahora la identidad viaja en el cuerpo de cada petición (`idUsuario`, `idCazarrecompensas`, `idAdministrador`) a partir de lo que devuelve `/login`.
