# BountyLine API (Spring Boot)

API REST del proyecto. Se conecta a MySQL en la máquina virtual `BountyLine-MySQL` (ver `bd/vm`) y ejecuta la lógica de negocio a través de los procedimientos almacenados de `bd/mysql/02_logica.sql`. MongoDB se integra en la siguiente etapa.

## Requisitos

- JDK 17 o superior.
- Maven 3.9 (o el Maven integrado de Spring Tool Suite).
- La VM `BountyLine-MySQL` encendida (MySQL en `127.0.0.1:3307`).

## Ejecutar

```powershell
cd backend
mvn spring-boot:run
```

En Spring Tool Suite: *File > Import > Existing Maven Projects*, elegir la carpeta `backend` y ejecutar `BountyLineApplication` como *Spring Boot App*.

La conexión se puede cambiar con variables de entorno: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT` y `CORS_ORIGEN`.

Prueba rápida: <http://localhost:8080/api/salud>

## Estructura

| Paquete | Contenido |
| :--- | :--- |
| `controller` | Endpoints REST |
| `service` | Reglas que se resuelven en la aplicación (hash de contraseñas, inicio de sesión) |
| `repository` | Consultas a vistas y tablas, y llamadas a procedimientos almacenados |
| `dto` | Objetos de entrada y salida (records) |
| `exception` | Manejo de errores: los `SIGNAL SQLSTATE '45000'` de MySQL llegan al cliente como 400 con su mensaje |

El usuario de base de datos `bountyline_app` solo puede consultar y ejecutar procedimientos, así que toda escritura pasa por la lógica de la base.

## Endpoints

| Método | Ruta | Procedimiento o vista |
| :--- | :--- | :--- |
| GET | `/api/salud` | |
| POST | `/api/cuentas/registro` | `sp_registrar_cuenta` |
| POST | `/api/cuentas/login` | |
| GET | `/api/catalogos/zonas` · `/api/catalogos/especialidades` | |
| POST | `/api/catalogos/zonas` · `/api/catalogos/especialidades` | `sp_crear_zona` · `sp_crear_especialidad` |
| GET | `/api/billeteras/{idCuenta}` | |
| POST | `/api/billeteras/{idCuenta}/recargas` | `sp_recargar_saldo` |
| GET | `/api/misiones?estado=&idUsuario=&idCazarrecompensas=` | `v_mision_detalle` |
| GET | `/api/misiones/{id}` | `v_mision_detalle` |
| POST | `/api/misiones` | `sp_publicar_mision` |
| GET / POST | `/api/misiones/{id}/postulaciones` | `sp_postular`, `fn_puntaje_match` |
| GET | `/api/misiones/{id}/sugerencias?limite=5` | `sp_sugerir_cazarrecompensas` |
| POST | `/api/misiones/{id}/asignacion` | `sp_asignar_cazarrecompensas` |
| POST | `/api/misiones/{id}/inicio` | `sp_iniciar_mision` |
| POST | `/api/misiones/{id}/cierre` | `sp_cerrar_mision` |
| POST | `/api/misiones/{id}/cancelacion` | `sp_cancelar_mision` |
| POST | `/api/misiones/{id}/calificacion` | `sp_calificar_mision` |
| GET | `/api/cazarrecompensas?idZona=&disponibilidad=` | `v_cazarrecompensas_perfil` |
| GET / POST | `/api/reportes` | `sp_crear_reporte` |
| POST | `/api/reportes/{id}/resolucion` | `sp_resolver_reporte` |

Cuentas de prueba (contraseña `BountyLine2026*`): `axiom_47@bountyline.gg` (usuario), `vanta_k@bountyline.gg` (cazarrecompensas), `admin@bountyline.gg` (administrador).

Por ahora la identidad viaja en el cuerpo de cada petición (`idUsuario`, `idCazarrecompensas`, `idAdministrador`) a partir de lo que devuelve `/login`. La protección con token queda para una etapa posterior.
