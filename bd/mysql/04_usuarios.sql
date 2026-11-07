-- =====================================================================
-- BountyLine - Usuarios de base de datos y permisos (privilegio mínimo)
-- bountyline_app   : lo usa el backend. Solo ejecuta procedimientos y
--                    consulta tablas y vistas; no puede escribir directo.
-- bountyline_admin : mantenimiento, carga de scripts y respaldos.
-- Cambie las contraseñas antes de usar fuera del laboratorio.
-- =====================================================================
SET NAMES utf8mb4;
DROP USER IF EXISTS 'bountyline_app'@'%';
DROP USER IF EXISTS 'bountyline_admin'@'%';

CREATE USER 'bountyline_app'@'%' IDENTIFIED BY 'BountyApp2026*';
CREATE USER 'bountyline_admin'@'%' IDENTIFIED BY 'BountyAdmin2026*';

GRANT SELECT, EXECUTE ON bountyline.* TO 'bountyline_app'@'%';
-- sp_registrar_administrador queda fuera del alcance de la aplicación (S30)
REVOKE EXECUTE ON bountyline.* FROM 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_registrar_cuenta TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_recargar_saldo TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_publicar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_postular TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_asignar_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_iniciar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cerrar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cancelar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_sugerir_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_calificar_mision TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_zona TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_especialidad TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_crear_reporte TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_resolver_reporte TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_usuario TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_cazarrecompensas TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_guardar_especialidad_caz TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_quitar_especialidad_caz TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_correo TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_contrasena TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_cambiar_estado_cuenta TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_zona TO 'bountyline_app'@'%';
GRANT EXECUTE ON PROCEDURE bountyline.sp_actualizar_especialidad TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_saldo_disponible TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_reputacion TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_misiones_completadas TO 'bountyline_app'@'%';
GRANT EXECUTE ON FUNCTION bountyline.fn_puntaje_match TO 'bountyline_app'@'%';

GRANT ALL PRIVILEGES ON bountyline.* TO 'bountyline_admin'@'%';

FLUSH PRIVILEGES;
