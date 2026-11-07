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

La configuración se puede cambiar con variables de entorno: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`, `CORS_ORIGEN`, `JWT_SECRETO` (mínimo 32 caracteres) y `JWT_HORAS` (duración del token, 8 por defecto).

Prueba rápida: <http://localhost:8080/api/salud>

Documentación interactiva (Swagger): <http://localhost:8080/swagger-ui.html>. Para probar rutas protegidas, inicie sesión en `/api/auth/login`, copie el `token` y péguelo en el botón *Authorize*.

## Estructura

Cada clase del modelo tiene su DTO, repositorio, servicio y controlador.

| Paquete | Contenido |
| :--- | :--- |
| `model` | Una clase por cada tabla de la base de datos |
| `dto` | Objetos de respuesta y de entrada de la API (records) |
| `repository` | Consultas a tablas y vistas, y llamadas a los procedimientos almacenados |
| `service` | Reglas de la aplicación (registro, inicio de sesión, validaciones) y conversión a DTO |
| `controller` | Endpoints REST |
| `config` | Seguridad (Spring Security con JWT), CORS y codificador BCrypt |
| `security` | Generación del token y lectura de la cuenta que hace la petición |
| `exception` | Manejo de errores: los `SIGNAL SQLSTATE '45000'` de MySQL llegan al cliente como 400 con su mensaje |

El usuario de base de datos `bountyline_app` solo puede consultar y ejecutar procedimientos, así que toda escritura pasa por la lógica de la base.

## Seguridad

- El registro (`POST /api/auth/registro`) y el inicio de sesión (`POST /api/auth/login`) devuelven un token JWT firmado (HS256) con el id de la cuenta, su alias y su rol.
- Todas las demás peticiones llevan el encabezado `Authorization: Bearer <token>`. Sin token responden 401.
- Son públicos: `/api/auth/registro`, `/api/auth/login`, `/api/salud`, Swagger y la consulta de zonas y especialidades (el formulario de registro las necesita).
- Los permisos van por rol (`USUARIO`, `CAZARRECOMPENSAS`, `ADMINISTRADOR`). Un rol que no corresponde recibe 403.
- Quién hace cada acción sale del token, no del cuerpo de la petición. Las rutas con `/yo` trabajan sobre la cuenta autenticada.
- El registro solo crea usuarios y cazarrecompensas. Los administradores se crean por script (S30).
- Las contraseñas se guardan como hash BCrypt (S11). Para cambiarla se pide la actual.
- Si un administrador suspende una cuenta, su token deja de servir en la siguiente petición (401), aunque no haya vencido.

## Endpoints

Roles: U = usuario, C = cazarrecompensas, A = administrador, todos = cualquier cuenta autenticada.

| Entidad | Método y ruta | Rol | Procedimiento o vista |
| :--- | :--- | :--- | :--- |
| Autenticación | `POST /api/auth/registro` | público | `sp_registrar_cuenta` |
| | `POST /api/auth/login` | público | |
| | `GET /api/auth/yo` | todos | |
| Cuenta | `GET /api/cuentas?rol=&estado=` | A | |
| | `GET /api/cuentas/{id}` | la propia o A | |
| | `PUT /api/cuentas/yo/correo` | todos | `sp_cambiar_correo` |
| | `PUT /api/cuentas/yo/contrasena` | todos | `sp_cambiar_contrasena` |
| | `PUT /api/cuentas/{id}/estado` | A | `sp_cambiar_estado_cuenta` |
| Usuario | `GET /api/usuarios` | A | |
| | `GET /api/usuarios/yo` · `PUT /api/usuarios/yo` | U | `sp_actualizar_usuario` |
| | `GET /api/usuarios/{id}` | todos | |
| Cazarrecompensas | `GET /api/cazarrecompensas?alias=&idZona=&idEspecialidad=&disponibilidad=` · `GET /api/cazarrecompensas/{id}` | todos | `v_cazarrecompensas_perfil` |
| | `GET /api/cazarrecompensas/yo/resumen` | C | `fn_misiones_completadas`, `fn_saldo_disponible` |
| | `GET /api/cazarrecompensas/yo` · `PUT /api/cazarrecompensas/yo` | C | `sp_actualizar_cazarrecompensas` |
| CazarrecompensasEspecialidad | `GET /api/cazarrecompensas/{id}/especialidades` | todos | |
| | `POST /api/cazarrecompensas/yo/especialidades` | C | `sp_guardar_especialidad_caz` |
| | `DELETE /api/cazarrecompensas/yo/especialidades/{idEspecialidad}` | C | `sp_quitar_especialidad_caz` |
| Administrador | `GET /api/administradores` · `GET /api/administradores/yo` · `GET /api/administradores/{id}` | A | |
| Billetera | `GET /api/billeteras/yo` | todos | |
| | `GET /api/billeteras/{idCuenta}` | la propia o A | |
| | `POST /api/billeteras/yo/recargas` | U, C | `sp_recargar_saldo` |
| Movimiento | `GET /api/movimientos?idCuenta=&idMision=&limite=` | todos (solo A filtra por otra cuenta) | |
| Zona | `GET /api/zonas` · `GET /api/zonas/{id}` | público | |
| | `POST /api/zonas` · `PUT /api/zonas/{id}` | A | `sp_crear_zona` · `sp_actualizar_zona` |
| Especialidad | `GET /api/especialidades` · `GET /api/especialidades/{id}` | público | |
| | `POST /api/especialidades` · `PUT /api/especialidades/{id}` | A | `sp_crear_especialidad` · `sp_actualizar_especialidad` |
| Misión | `GET /api/misiones?estado=&idUsuario=&idCazarrecompensas=&idZona=&idEspecialidad=&texto=` · `GET /api/misiones/{id}` | todos | `v_mision_detalle` |
| | `GET /api/misiones/mias?estado=` | U, C | `v_mision_detalle` |
| | `POST /api/misiones` | U | `sp_publicar_mision` |
| | `GET /api/misiones/{id}/sugerencias?limite=5` | U, A | `sp_sugerir_cazarrecompensas` |
| | `POST /api/misiones/{id}/asignacion` | U | `sp_asignar_cazarrecompensas` |
| | `POST /api/misiones/{id}/inicio` | C | `sp_iniciar_mision` |
| | `POST /api/misiones/{id}/cierre` | U | `sp_cerrar_mision` |
| | `POST /api/misiones/{id}/cancelacion` | U, A | `sp_cancelar_mision` |
| Postulación | `GET /api/postulaciones?idMision=&idCazarrecompensas=` | todos | `fn_puntaje_match` |
| | `GET /api/postulaciones/mias` | C | |
| | `POST /api/postulaciones` | C | `sp_postular` |
| Calificación | `GET /api/calificaciones?idMision=&idCazarrecompensas=` | todos | |
| | `POST /api/calificaciones` | U | `sp_calificar_mision` |
| Reporte | `GET /api/reportes?estado=` · `GET /api/reportes/{id}` | A | |
| | `POST /api/reportes` | U, C | `sp_crear_reporte` |
| | `POST /api/reportes/{id}/resolucion` | A | `sp_resolver_reporte` |
| AuditoriaCuenta | `GET /api/auditoria-cuentas?idCuenta=` | A | |
| Bitácora | `GET /api/bitacora?tipo=&idCuenta=&desde=&hasta=&limite=` | A | `v_bitacora` |
| | `GET /api/salud` | público | Prueba de conexión |

Los movimientos y la auditoría solo se consultan: los crean los procedimientos y los triggers, y la base no deja modificarlos.

## Ejemplo

```http
POST /api/auth/login
Content-Type: application/json

{ "correo": "axiom_47@bountyline.gg", "contrasena": "BountyLine2026*" }
```

Respuesta:

```json
{ "token": "eyJ...", "tipo": "Bearer", "expira": "2026-11-03T06:00:00Z", "idCuenta": 3, "alias": "AXIOM_47", "rol": "USUARIO" }
```

Cuentas de prueba (contraseña `BountyLine2026*`): `axiom_47@bountyline.gg` (usuario), `vanta_k@bountyline.gg` (cazarrecompensas), `admin@bountyline.gg` (administrador).

## Pruebas

```bash
./mvnw test
```

Las pruebas de `src/test` cubren el registro y el inicio de sesión, el cambio de contraseña, el token JWT, los permisos de la sesión, el bloqueo de cuentas suspendidas, la bitácora y el escape de los filtros de texto. No necesitan la base de datos, salvo `BountylineApplicationTests`, que levanta la aplicación completa y requiere la VM encendida.
