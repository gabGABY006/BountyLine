-- =====================================================================
-- BountyLine - Lógica de negocio en la base de datos
-- Funciones, procedimientos almacenados, triggers y vistas.
-- Ejecutar después de 01_creacion.sql con el cliente mysql.
-- Errores de negocio: SIGNAL SQLSTATE '45000' con un mensaje claro.
-- Errores técnicos: EXIT HANDLER que hace ROLLBACK y RESIGNAL.
-- =====================================================================
SET NAMES utf8mb4;
USE bountyline;

DELIMITER $$

-- =====================================================================
-- FUNCIONES
-- =====================================================================

-- Saldo disponible de una billetera
DROP FUNCTION IF EXISTS fn_saldo_disponible $$
CREATE FUNCTION fn_saldo_disponible(p_id_billetera INT UNSIGNED)
RETURNS DECIMAL(12,2)
READS SQL DATA
BEGIN
    DECLARE v_saldo DECIMAL(12,2);
    SELECT saldo_disponible INTO v_saldo FROM billetera WHERE id_billetera = p_id_billetera;
    RETURN IFNULL(v_saldo, 0);
END $$

-- Promedio de calificaciones de un cazarrecompensas (NULL si no tiene) - S27
DROP FUNCTION IF EXISTS fn_reputacion $$
CREATE FUNCTION fn_reputacion(p_id_cazarrecompensas INT UNSIGNED)
RETURNS DECIMAL(3,2)
READS SQL DATA
BEGIN
    DECLARE v_promedio DECIMAL(3,2);
    SELECT ROUND(AVG(c.puntaje), 2) INTO v_promedio
      FROM calificacion c
      JOIN mision m ON m.id_mision = c.id_mision
     WHERE m.id_cazarrecompensas = p_id_cazarrecompensas;
    RETURN v_promedio;
END $$

-- Cantidad de misiones cerradas por un cazarrecompensas
DROP FUNCTION IF EXISTS fn_misiones_completadas $$
CREATE FUNCTION fn_misiones_completadas(p_id_cazarrecompensas INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_total INT;
    SELECT COUNT(*) INTO v_total
      FROM mision
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND estado = 'CERRADA';
    RETURN v_total;
END $$

-- Puntaje de emparejamiento (0 a 100) entre un cazarrecompensas y una misión:
--   40 puntos si la zona base coincide con la zona de la misión
--   hasta 40 puntos según el nivel (1 a 5) en la especialidad requerida
--   hasta 20 puntos según la reputación (sin calificaciones cuenta como 3)
DROP FUNCTION IF EXISTS fn_puntaje_match $$
CREATE FUNCTION fn_puntaje_match(p_id_cazarrecompensas INT UNSIGNED, p_id_mision INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_zona_caz INT UNSIGNED;
    DECLARE v_rep DECIMAL(3,2);
    DECLARE v_zona_mis INT UNSIGNED;
    DECLARE v_esp_mis INT UNSIGNED;
    DECLARE v_nivel INT DEFAULT 0;

    SELECT id_zona, reputacion INTO v_zona_caz, v_rep
      FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas;
    SELECT id_zona, id_especialidad INTO v_zona_mis, v_esp_mis
      FROM mision WHERE id_mision = p_id_mision;
    SELECT IFNULL(MAX(nivel), 0) INTO v_nivel
      FROM cazarrecompensas_especialidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = v_esp_mis;

    RETURN IF(v_zona_caz = v_zona_mis, 40, 0)
         + v_nivel * 8
         + ROUND(IFNULL(v_rep, 3) * 4);
END $$

-- =====================================================================
-- PROCEDIMIENTOS: CUENTAS
-- =====================================================================

-- Registra una cuenta de Usuario o Cazarrecompensas con su perfil y su billetera
-- en una sola transacción (S30, S37). p_especialidades es un arreglo JSON:
--   [{"id": 1, "nivel": 4}, {"id": 3, "nivel": 2}]
DROP PROCEDURE IF EXISTS sp_registrar_cuenta $$
CREATE PROCEDURE sp_registrar_cuenta(
    IN  p_correo          VARCHAR(120),
    IN  p_alias           VARCHAR(40),
    IN  p_contrasena_hash VARCHAR(100),
    IN  p_rol             VARCHAR(20),
    IN  p_biografia       VARCHAR(500),
    IN  p_id_zona         INT UNSIGNED,
    IN  p_especialidades  JSON,
    OUT p_id_cuenta       INT UNSIGNED)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_rol NOT IN ('USUARIO', 'CAZARRECOMPENSAS') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Desde la aplicación solo se registran cuentas de Usuario o Cazarrecompensas.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE correo = p_correo) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está registrado.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE alias = p_alias) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El alias ya está en uso.';
    END IF;
    IF p_rol = 'CAZARRECOMPENSAS' THEN
        IF p_id_zona IS NULL OR NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe tener una zona base válida.';
        END IF;
        IF p_especialidades IS NULL OR JSON_LENGTH(p_especialidades) = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe registrar al menos una especialidad.';
        END IF;
    END IF;

    START TRANSACTION;
        INSERT INTO cuenta (correo, alias, contrasena_hash, rol)
        VALUES (p_correo, p_alias, p_contrasena_hash, p_rol);
        SET p_id_cuenta = LAST_INSERT_ID();

        IF p_rol = 'USUARIO' THEN
            INSERT INTO usuario (id_usuario, biografia) VALUES (p_id_cuenta, p_biografia);
        ELSE
            INSERT INTO cazarrecompensas (id_cazarrecompensas, id_zona, biografia)
            VALUES (p_id_cuenta, p_id_zona, p_biografia);

            INSERT INTO cazarrecompensas_especialidad (id_cazarrecompensas, id_especialidad, nivel)
            SELECT p_id_cuenta, j.id, j.nivel
              FROM JSON_TABLE(p_especialidades, '$[*]'
                   COLUMNS (id INT UNSIGNED PATH '$.id', nivel TINYINT UNSIGNED PATH '$.nivel')) AS j;
        END IF;

        INSERT INTO billetera (id_cuenta) VALUES (p_id_cuenta);
    COMMIT;
END $$

-- Crea una cuenta de Administrador. Solo lo ejecuta el usuario de base de datos
-- administrador durante la instalación (S30); la aplicación no tiene permiso.
DROP PROCEDURE IF EXISTS sp_registrar_administrador $$
CREATE PROCEDURE sp_registrar_administrador(
    IN  p_correo          VARCHAR(120),
    IN  p_alias           VARCHAR(40),
    IN  p_contrasena_hash VARCHAR(100),
    IN  p_nombre          VARCHAR(80),
    IN  p_nivel_acceso    VARCHAR(15),
    OUT p_id_cuenta       INT UNSIGNED)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        INSERT INTO cuenta (correo, alias, contrasena_hash, rol)
        VALUES (p_correo, p_alias, p_contrasena_hash, 'ADMINISTRADOR');
        SET p_id_cuenta = LAST_INSERT_ID();
        INSERT INTO administrador (id_administrador, nombre, nivel_acceso)
        VALUES (p_id_cuenta, p_nombre, p_nivel_acceso);
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: BILLETERA
-- =====================================================================

-- Recarga simulada de créditos (S46)
DROP PROCEDURE IF EXISTS sp_recargar_saldo $$
CREATE PROCEDURE sp_recargar_saldo(
    IN p_id_cuenta INT UNSIGNED,
    IN p_monto     DECIMAL(12,2))
BEGIN
    DECLARE v_id_billetera INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_monto IS NULL OR p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto de la recarga debe ser mayor que cero.';
    END IF;
    SELECT estado INTO v_estado FROM cuenta WHERE id_cuenta = p_id_cuenta;
    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    ELSEIF v_estado = 'SUSPENDIDA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta está suspendida.';
    END IF;

    START TRANSACTION;
        SELECT id_billetera INTO v_id_billetera
          FROM billetera WHERE id_cuenta = p_id_cuenta FOR UPDATE;
        IF v_id_billetera IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene billetera.';
        END IF;

        UPDATE billetera SET saldo_disponible = saldo_disponible + p_monto
         WHERE id_billetera = v_id_billetera;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_id_billetera, NULL, 'RECARGA', p_monto, 'Recarga simulada de créditos');
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: MISIONES
-- =====================================================================

-- Publica una misión y retiene el monto del saldo disponible (S52)
DROP PROCEDURE IF EXISTS sp_publicar_mision $$
CREATE PROCEDURE sp_publicar_mision(
    IN  p_id_usuario      INT UNSIGNED,
    IN  p_id_zona         INT UNSIGNED,
    IN  p_id_especialidad INT UNSIGNED,
    IN  p_titulo          VARCHAR(120),
    IN  p_descripcion     TEXT,
    IN  p_monto           DECIMAL(12,2),
    OUT p_id_mision       INT UNSIGNED)
BEGIN
    DECLARE v_id_billetera INT UNSIGNED;
    DECLARE v_disponible DECIMAL(12,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF NOT EXISTS (SELECT 1 FROM usuario u JOIN cuenta c ON c.id_cuenta = u.id_usuario
                    WHERE u.id_usuario = p_id_usuario AND c.estado = 'ACTIVA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un usuario activo puede publicar misiones.';
    END IF;
    IF p_monto IS NULL OR p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto de la recompensa debe ser mayor que cero.';
    END IF;

    START TRANSACTION;
        SELECT id_billetera, saldo_disponible INTO v_id_billetera, v_disponible
          FROM billetera WHERE id_cuenta = p_id_usuario FOR UPDATE;
        IF v_disponible < p_monto THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para publicar la misión.';
        END IF;

        INSERT INTO mision (id_usuario, id_zona, id_especialidad, titulo, descripcion, monto_recompensa)
        VALUES (p_id_usuario, p_id_zona, p_id_especialidad, p_titulo, p_descripcion, p_monto);
        SET p_id_mision = LAST_INSERT_ID();

        UPDATE billetera
           SET saldo_disponible = saldo_disponible - p_monto,
               saldo_retenido   = saldo_retenido + p_monto
         WHERE id_billetera = v_id_billetera;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_id_billetera, p_id_mision, 'RETENCION', p_monto, CONCAT('Retención por la misión ', p_id_mision));
    COMMIT;
END $$

-- Un cazarrecompensas se postula a una misión publicada (S56, S57)
DROP PROCEDURE IF EXISTS sp_postular $$
CREATE PROCEDURE sp_postular(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_mensaje             VARCHAR(500))
BEGIN
    DECLARE v_estado VARCHAR(15);

    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas z JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
                    WHERE z.id_cazarrecompensas = p_id_cazarrecompensas AND c.estado = 'ACTIVA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un cazarrecompensas activo puede postularse.';
    END IF;
    SELECT estado INTO v_estado FROM mision WHERE id_mision = p_id_mision;
    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
    ELSEIF v_estado <> 'PUBLICADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede postular a misiones en estado PUBLICADA.';
    END IF;
    IF EXISTS (SELECT 1 FROM postulacion WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas ya se postuló a esta misión.';
    END IF;

    INSERT INTO postulacion (id_mision, id_cazarrecompensas, mensaje)
    VALUES (p_id_mision, p_id_cazarrecompensas, p_mensaje);
END $$

-- El usuario asigna la misión a uno de los postulados (S56, S58)
DROP PROCEDURE IF EXISTS sp_asignar_cazarrecompensas $$
CREATE PROCEDURE sp_asignar_cazarrecompensas(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_usuario          INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado INTO v_dueno, v_estado
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL OR v_dueno <> p_id_usuario THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede asignarla.';
        END IF;
        IF v_estado <> 'PUBLICADA' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden asignar misiones en estado PUBLICADA.';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM postulacion
                        WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas asignado debe ser uno de los postulados.';
        END IF;

        UPDATE mision SET id_cazarrecompensas = p_id_cazarrecompensas, estado = 'ASIGNADA'
         WHERE id_mision = p_id_mision;
        UPDATE postulacion
           SET estado_postulacion = IF(id_cazarrecompensas = p_id_cazarrecompensas, 'ACEPTADA', 'RECHAZADA')
         WHERE id_mision = p_id_mision;
    COMMIT;
END $$

-- El cazarrecompensas asignado inicia la misión (ASIGNADA -> EN_CURSO)
DROP PROCEDURE IF EXISTS sp_iniciar_mision $$
CREATE PROCEDURE sp_iniciar_mision(
    IN p_id_mision           INT UNSIGNED,
    IN p_id_cazarrecompensas INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision
                    WHERE id_mision = p_id_mision AND id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el cazarrecompensas asignado puede iniciar la misión.';
    END IF;
    UPDATE mision SET estado = 'EN_CURSO' WHERE id_mision = p_id_mision;   -- el trigger valida la transición
END $$

-- El usuario confirma el cierre: se libera el pago en una sola transacción (S59)
DROP PROCEDURE IF EXISTS sp_cerrar_mision $$
CREATE PROCEDURE sp_cerrar_mision(
    IN p_id_mision  INT UNSIGNED,
    IN p_id_usuario INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE v_monto DECIMAL(12,2);
    DECLARE v_caz INT UNSIGNED;
    DECLARE v_bil_usuario INT UNSIGNED;
    DECLARE v_bil_caz INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado, monto_recompensa, id_cazarrecompensas
          INTO v_dueno, v_estado, v_monto, v_caz
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL OR v_dueno <> p_id_usuario THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede cerrarla.';
        END IF;
        IF v_estado <> 'EN_CURSO' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden cerrar misiones en estado EN_CURSO.';
        END IF;

        SELECT id_billetera INTO v_bil_usuario FROM billetera WHERE id_cuenta = v_dueno FOR UPDATE;
        SELECT id_billetera INTO v_bil_caz FROM billetera WHERE id_cuenta = v_caz FOR UPDATE;

        UPDATE billetera SET saldo_retenido = saldo_retenido - v_monto WHERE id_billetera = v_bil_usuario;
        UPDATE billetera SET saldo_disponible = saldo_disponible + v_monto WHERE id_billetera = v_bil_caz;

        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion) VALUES
            (v_bil_usuario, p_id_mision, 'PAGO', v_monto, CONCAT('Pago de la misión ', p_id_mision)),
            (v_bil_caz, p_id_mision, 'COBRO', v_monto, CONCAT('Cobro de la misión ', p_id_mision));

        UPDATE mision SET estado = 'CERRADA', fecha_cierre = NOW() WHERE id_mision = p_id_mision;
    COMMIT;
END $$

-- Cancela una misión y devuelve el monto retenido (S60). La cancela su usuario
-- (p_id_administrador = NULL) o un administrador (S34).
DROP PROCEDURE IF EXISTS sp_cancelar_mision $$
CREATE PROCEDURE sp_cancelar_mision(
    IN p_id_mision        INT UNSIGNED,
    IN p_id_usuario       INT UNSIGNED,
    IN p_id_administrador INT UNSIGNED)
BEGIN
    DECLARE v_dueno INT UNSIGNED;
    DECLARE v_estado VARCHAR(15);
    DECLARE v_monto DECIMAL(12,2);
    DECLARE v_bil_usuario INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT id_usuario, estado, monto_recompensa INTO v_dueno, v_estado, v_monto
          FROM mision WHERE id_mision = p_id_mision FOR UPDATE;
        IF v_dueno IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
        END IF;
        IF p_id_administrador IS NULL AND (p_id_usuario IS NULL OR v_dueno <> p_id_usuario) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión o un administrador puede cancelarla.';
        END IF;
        IF p_id_administrador IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El administrador no existe.';
        END IF;
        IF v_estado NOT IN ('PUBLICADA', 'ASIGNADA', 'EN_CURSO') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión ya está cerrada o cancelada.';
        END IF;

        SELECT id_billetera INTO v_bil_usuario FROM billetera WHERE id_cuenta = v_dueno FOR UPDATE;
        UPDATE billetera
           SET saldo_retenido   = saldo_retenido - v_monto,
               saldo_disponible = saldo_disponible + v_monto
         WHERE id_billetera = v_bil_usuario;
        INSERT INTO movimiento (id_billetera, id_mision, tipo, monto, descripcion)
        VALUES (v_bil_usuario, p_id_mision, 'REEMBOLSO', v_monto, CONCAT('Reembolso por cancelación de la misión ', p_id_mision));

        UPDATE mision SET estado = 'CANCELADA', id_admin_cancela = p_id_administrador
         WHERE id_mision = p_id_mision;
        UPDATE postulacion SET estado_postulacion = 'RECHAZADA'
         WHERE id_mision = p_id_mision AND estado_postulacion = 'PENDIENTE';
    COMMIT;
END $$

-- Sugerencias de cazarrecompensas DISPONIBLES para una misión (S24), ordenadas por puntaje
DROP PROCEDURE IF EXISTS sp_sugerir_cazarrecompensas $$
CREATE PROCEDURE sp_sugerir_cazarrecompensas(
    IN p_id_mision INT UNSIGNED,
    IN p_limite    INT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision WHERE id_mision = p_id_mision) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión no existe.';
    END IF;

    SELECT z.id_cazarrecompensas,
           c.alias,
           zo.nombre                                  AS zona,
           z.reputacion,
           fn_misiones_completadas(z.id_cazarrecompensas) AS misiones_completadas,
           fn_puntaje_match(z.id_cazarrecompensas, p_id_mision) AS puntaje
      FROM cazarrecompensas z
      JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
      JOIN zona zo  ON zo.id_zona = z.id_zona
     WHERE z.disponibilidad = 'DISPONIBLE'
       AND c.estado = 'ACTIVA'
     ORDER BY puntaje DESC, misiones_completadas DESC
     LIMIT p_limite;
END $$

-- El usuario califica una misión cerrada (S62, S63)
DROP PROCEDURE IF EXISTS sp_calificar_mision $$
CREATE PROCEDURE sp_calificar_mision(
    IN p_id_mision  INT UNSIGNED,
    IN p_id_usuario INT UNSIGNED,
    IN p_puntaje    TINYINT UNSIGNED,
    IN p_comentario VARCHAR(500))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM mision WHERE id_mision = p_id_mision AND id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo el usuario que publicó la misión puede calificarla.';
    END IF;
    IF EXISTS (SELECT 1 FROM calificacion WHERE id_mision = p_id_mision) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La misión ya fue calificada.';
    END IF;
    INSERT INTO calificacion (id_mision, puntaje, comentario)
    VALUES (p_id_mision, p_puntaje, p_comentario);         -- trg_validar_calificacion revisa el estado
END $$

-- =====================================================================
-- PROCEDIMIENTOS: CATÁLOGOS Y MODERACIÓN
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_crear_zona $$
CREATE PROCEDURE sp_crear_zona(
    IN  p_id_administrador INT UNSIGNED,
    IN  p_nombre           VARCHAR(60),
    IN  p_descripcion      VARCHAR(300),
    IN  p_nivel_peligro    TINYINT UNSIGNED,
    OUT p_id_zona          INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede crear zonas.';
    END IF;
    IF EXISTS (SELECT 1 FROM zona WHERE nombre = p_nombre) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una zona con ese nombre.';
    END IF;
    INSERT INTO zona (nombre, descripcion, nivel_peligro, id_administrador)
    VALUES (p_nombre, p_descripcion, p_nivel_peligro, p_id_administrador);
    SET p_id_zona = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_crear_especialidad $$
CREATE PROCEDURE sp_crear_especialidad(
    IN  p_id_administrador INT UNSIGNED,
    IN  p_nombre           VARCHAR(60),
    IN  p_descripcion      VARCHAR(300),
    OUT p_id_especialidad  INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede crear especialidades.';
    END IF;
    IF EXISTS (SELECT 1 FROM especialidad WHERE nombre = p_nombre) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una especialidad con ese nombre.';
    END IF;
    INSERT INTO especialidad (nombre, descripcion, id_administrador)
    VALUES (p_nombre, p_descripcion, p_id_administrador);
    SET p_id_especialidad = LAST_INSERT_ID();
END $$

-- Crea un reporte contra una cuenta o contra un contenido de MongoDB (S72)
DROP PROCEDURE IF EXISTS sp_crear_reporte $$
CREATE PROCEDURE sp_crear_reporte(
    IN  p_id_cuenta_reporta   INT UNSIGNED,
    IN  p_id_cuenta_reportada INT UNSIGNED,
    IN  p_id_contenido        VARCHAR(24),
    IN  p_motivo              VARCHAR(300),
    OUT p_id_reporte          INT UNSIGNED)
BEGIN
    IF (p_id_cuenta_reportada IS NULL) = (p_id_contenido IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte debe dirigirse a una cuenta o a un contenido, no a ambos.';
    END IF;
    IF p_id_cuenta_reportada = p_id_cuenta_reporta THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una cuenta no puede reportarse a sí misma.';
    END IF;
    INSERT INTO reporte (id_cuenta_reporta, id_cuenta_reportada, id_contenido, motivo)
    VALUES (p_id_cuenta_reporta, p_id_cuenta_reportada, p_id_contenido, p_motivo);
    SET p_id_reporte = LAST_INSERT_ID();
END $$

-- Un administrador atiende un reporte y, si corresponde, suspende la cuenta señalada (S33, S35)
DROP PROCEDURE IF EXISTS sp_resolver_reporte $$
CREATE PROCEDURE sp_resolver_reporte(
    IN p_id_reporte       INT UNSIGNED,
    IN p_id_administrador INT UNSIGNED,
    IN p_estado           VARCHAR(12),
    IN p_suspender        BOOLEAN)
BEGIN
    DECLARE v_estado VARCHAR(12);
    DECLARE v_reportada INT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_estado NOT IN ('RESUELTO', 'DESCARTADO') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte solo puede quedar RESUELTO o DESCARTADO.';
    END IF;

    START TRANSACTION;
        SELECT estado, id_cuenta_reportada INTO v_estado, v_reportada
          FROM reporte WHERE id_reporte = p_id_reporte FOR UPDATE;
        IF v_estado IS NULL OR v_estado <> 'PENDIENTE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe o ya fue atendido.';
        END IF;

        UPDATE reporte
           SET estado = p_estado, id_administrador = p_id_administrador, fecha_resolucion = NOW()
         WHERE id_reporte = p_id_reporte;

        IF p_suspender AND p_estado = 'RESUELTO' AND v_reportada IS NOT NULL THEN
            UPDATE cuenta SET estado = 'SUSPENDIDA' WHERE id_cuenta = v_reportada;  -- queda en auditoría
        END IF;
    COMMIT;
END $$

-- =====================================================================
-- PROCEDIMIENTOS: ACTUALIZACIÓN DE PERFILES, CUENTAS Y CATÁLOGOS
-- =====================================================================

-- El usuario actualiza su biografía (S19)
DROP PROCEDURE IF EXISTS sp_actualizar_usuario $$
CREATE PROCEDURE sp_actualizar_usuario(
    IN p_id_usuario INT UNSIGNED,
    IN p_biografia  VARCHAR(500))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE id_usuario = p_id_usuario) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe.';
    END IF;
    UPDATE usuario SET biografia = p_biografia WHERE id_usuario = p_id_usuario;
END $$

-- El cazarrecompensas actualiza su zona base, biografía y disponibilidad (S23 a S25)
DROP PROCEDURE IF EXISTS sp_actualizar_cazarrecompensas $$
CREATE PROCEDURE sp_actualizar_cazarrecompensas(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_zona             INT UNSIGNED,
    IN p_biografia           VARCHAR(500),
    IN p_disponibilidad      VARCHAR(15))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no existe.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La zona no existe.';
    END IF;
    IF p_disponibilidad NOT IN ('DISPONIBLE', 'NO_DISPONIBLE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La disponibilidad debe ser DISPONIBLE o NO_DISPONIBLE.';
    END IF;
    UPDATE cazarrecompensas
       SET id_zona = p_id_zona, biografia = p_biografia, disponibilidad = p_disponibilidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas;
END $$

-- Agrega una especialidad al cazarrecompensas o cambia su nivel (S26)
DROP PROCEDURE IF EXISTS sp_guardar_especialidad_caz $$
CREATE PROCEDURE sp_guardar_especialidad_caz(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_especialidad     INT UNSIGNED,
    IN p_nivel               TINYINT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas WHERE id_cazarrecompensas = p_id_cazarrecompensas) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no existe.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM especialidad WHERE id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La especialidad no existe.';
    END IF;
    IF p_nivel IS NULL OR p_nivel NOT BETWEEN 1 AND 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nivel debe estar entre 1 y 5.';
    END IF;
    INSERT INTO cazarrecompensas_especialidad (id_cazarrecompensas, id_especialidad, nivel)
    VALUES (p_id_cazarrecompensas, p_id_especialidad, p_nivel)
    ON DUPLICATE KEY UPDATE nivel = p_nivel;
END $$

-- Quita una especialidad; el cazarrecompensas debe conservar al menos una (S26)
DROP PROCEDURE IF EXISTS sp_quitar_especialidad_caz $$
CREATE PROCEDURE sp_quitar_especialidad_caz(
    IN p_id_cazarrecompensas INT UNSIGNED,
    IN p_id_especialidad     INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cazarrecompensas_especialidad
                    WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas no tiene esa especialidad.';
    END IF;
    IF (SELECT COUNT(*) FROM cazarrecompensas_especialidad WHERE id_cazarrecompensas = p_id_cazarrecompensas) <= 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cazarrecompensas debe conservar al menos una especialidad.';
    END IF;
    DELETE FROM cazarrecompensas_especialidad
     WHERE id_cazarrecompensas = p_id_cazarrecompensas AND id_especialidad = p_id_especialidad;
END $$

-- Cambia el correo de una cuenta; queda en la auditoría (S9, S76)
DROP PROCEDURE IF EXISTS sp_cambiar_correo $$
CREATE PROCEDURE sp_cambiar_correo(
    IN p_id_cuenta INT UNSIGNED,
    IN p_correo    VARCHAR(120))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cuenta WHERE id_cuenta = p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM cuenta WHERE correo = p_correo AND id_cuenta <> p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El correo ya está registrado.';
    END IF;
    UPDATE cuenta SET correo = p_correo WHERE id_cuenta = p_id_cuenta;
END $$

-- Un administrador suspende o reactiva una cuenta; queda en la auditoría (S14, S35)
DROP PROCEDURE IF EXISTS sp_cambiar_estado_cuenta $$
CREATE PROCEDURE sp_cambiar_estado_cuenta(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_cuenta        INT UNSIGNED,
    IN p_estado           VARCHAR(15))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede cambiar el estado de una cuenta.';
    END IF;
    IF p_estado NOT IN ('ACTIVA', 'SUSPENDIDA') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estado debe ser ACTIVA o SUSPENDIDA.';
    END IF;
    IF p_id_cuenta = p_id_administrador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un administrador no puede cambiar el estado de su propia cuenta.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM cuenta WHERE id_cuenta = p_id_cuenta) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no existe.';
    END IF;
    UPDATE cuenta SET estado = p_estado WHERE id_cuenta = p_id_cuenta;
END $$

DROP PROCEDURE IF EXISTS sp_actualizar_zona $$
CREATE PROCEDURE sp_actualizar_zona(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_zona          INT UNSIGNED,
    IN p_nombre           VARCHAR(60),
    IN p_descripcion      VARCHAR(300),
    IN p_nivel_peligro    TINYINT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede modificar zonas.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM zona WHERE id_zona = p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La zona no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM zona WHERE nombre = p_nombre AND id_zona <> p_id_zona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una zona con ese nombre.';
    END IF;
    UPDATE zona SET nombre = p_nombre, descripcion = p_descripcion, nivel_peligro = p_nivel_peligro
     WHERE id_zona = p_id_zona;
END $$

DROP PROCEDURE IF EXISTS sp_actualizar_especialidad $$
CREATE PROCEDURE sp_actualizar_especialidad(
    IN p_id_administrador INT UNSIGNED,
    IN p_id_especialidad  INT UNSIGNED,
    IN p_nombre           VARCHAR(60),
    IN p_descripcion      VARCHAR(300))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administrador WHERE id_administrador = p_id_administrador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo un administrador puede modificar especialidades.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM especialidad WHERE id_especialidad = p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La especialidad no existe.';
    END IF;
    IF EXISTS (SELECT 1 FROM especialidad WHERE nombre = p_nombre AND id_especialidad <> p_id_especialidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una especialidad con ese nombre.';
    END IF;
    UPDATE especialidad SET nombre = p_nombre, descripcion = p_descripcion
     WHERE id_especialidad = p_id_especialidad;
END $$

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Impide transiciones de estado no permitidas en Misión (S55)
DROP TRIGGER IF EXISTS trg_validar_estado_mision $$
CREATE TRIGGER trg_validar_estado_mision
BEFORE UPDATE ON mision
FOR EACH ROW
BEGIN
    IF NEW.estado <> OLD.estado AND NOT (
           (OLD.estado = 'PUBLICADA' AND NEW.estado IN ('ASIGNADA', 'CANCELADA'))
        OR (OLD.estado = 'ASIGNADA'  AND NEW.estado IN ('EN_CURSO', 'CANCELADA'))
        OR (OLD.estado = 'EN_CURSO'  AND NEW.estado IN ('CERRADA', 'CANCELADA'))) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado de misión no permitida.';
    END IF;
    IF NEW.estado = 'ASIGNADA' AND NEW.id_cazarrecompensas IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una misión ASIGNADA debe tener cazarrecompensas.';
    END IF;
END $$

-- Recalcula la reputación del cazarrecompensas al recibir una calificación (S27)
DROP TRIGGER IF EXISTS trg_actualizar_reputacion $$
CREATE TRIGGER trg_actualizar_reputacion
AFTER INSERT ON calificacion
FOR EACH ROW
BEGIN
    DECLARE v_caz INT UNSIGNED;
    SELECT id_cazarrecompensas INTO v_caz FROM mision WHERE id_mision = NEW.id_mision;
    UPDATE cazarrecompensas SET reputacion = fn_reputacion(v_caz)
     WHERE id_cazarrecompensas = v_caz;
END $$

-- Impide saldos negativos con un mensaje claro (S40)
DROP TRIGGER IF EXISTS trg_validar_saldo $$
CREATE TRIGGER trg_validar_saldo
BEFORE UPDATE ON billetera
FOR EACH ROW
BEGIN
    IF NEW.saldo_disponible < 0 OR NEW.saldo_retenido < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La operación dejaría un saldo negativo.';
    END IF;
END $$

-- Solo se califican misiones CERRADAS (S62)
DROP TRIGGER IF EXISTS trg_validar_calificacion $$
CREATE TRIGGER trg_validar_calificacion
BEFORE INSERT ON calificacion
FOR EACH ROW
BEGIN
    IF (SELECT estado FROM mision WHERE id_mision = NEW.id_mision) <> 'CERRADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden calificar misiones CERRADAS.';
    END IF;
END $$

-- Registra en la auditoría los cambios de estado y de correo (S76, S77)
DROP TRIGGER IF EXISTS trg_auditoria_cuenta $$
CREATE TRIGGER trg_auditoria_cuenta
AFTER UPDATE ON cuenta
FOR EACH ROW
BEGIN
    IF NEW.estado <> OLD.estado THEN
        INSERT INTO auditoria_cuenta (id_cuenta, campo_modificado, valor_anterior, valor_nuevo, usuario_bd)
        VALUES (NEW.id_cuenta, 'estado', OLD.estado, NEW.estado, USER());
    END IF;
    IF NEW.correo <> OLD.correo THEN
        INSERT INTO auditoria_cuenta (id_cuenta, campo_modificado, valor_anterior, valor_nuevo, usuario_bd)
        VALUES (NEW.id_cuenta, 'correo', OLD.correo, NEW.correo, USER());
    END IF;
END $$

-- El rol no cambia después del registro (S13)
DROP TRIGGER IF EXISTS trg_rol_inmutable $$
CREATE TRIGGER trg_rol_inmutable
BEFORE UPDATE ON cuenta
FOR EACH ROW
BEGIN
    IF NEW.rol <> OLD.rol THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol de una cuenta no se puede cambiar.';
    END IF;
END $$

-- Los movimientos y la auditoría no se modifican ni se eliminan (S48, S79)
DROP TRIGGER IF EXISTS trg_movimiento_inmutable $$
CREATE TRIGGER trg_movimiento_inmutable
BEFORE UPDATE ON movimiento
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los movimientos no se pueden modificar.';
END $$

DROP TRIGGER IF EXISTS trg_movimiento_no_borrar $$
CREATE TRIGGER trg_movimiento_no_borrar
BEFORE DELETE ON movimiento
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los movimientos no se pueden eliminar.';
END $$

DROP TRIGGER IF EXISTS trg_auditoria_inmutable $$
CREATE TRIGGER trg_auditoria_inmutable
BEFORE UPDATE ON auditoria_cuenta
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La auditoría no se puede modificar.';
END $$

DROP TRIGGER IF EXISTS trg_auditoria_no_borrar $$
CREATE TRIGGER trg_auditoria_no_borrar
BEFORE DELETE ON auditoria_cuenta
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La auditoría no se puede eliminar.';
END $$

-- Cada perfil debe coincidir con el rol de su cuenta (especialización disjunta)
DROP TRIGGER IF EXISTS trg_rol_usuario $$
CREATE TRIGGER trg_rol_usuario
BEFORE INSERT ON usuario
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_usuario) <> 'USUARIO' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol USUARIO.';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_rol_cazarrecompensas $$
CREATE TRIGGER trg_rol_cazarrecompensas
BEFORE INSERT ON cazarrecompensas
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_cazarrecompensas) <> 'CAZARRECOMPENSAS' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol CAZARRECOMPENSAS.';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_rol_administrador $$
CREATE TRIGGER trg_rol_administrador
BEFORE INSERT ON administrador
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_administrador) <> 'ADMINISTRADOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no tiene rol ADMINISTRADOR.';
    END IF;
END $$

-- Los administradores no tienen billetera (S36)
DROP TRIGGER IF EXISTS trg_billetera_jugador $$
CREATE TRIGGER trg_billetera_jugador
BEFORE INSERT ON billetera
FOR EACH ROW
BEGIN
    IF (SELECT rol FROM cuenta WHERE id_cuenta = NEW.id_cuenta) = 'ADMINISTRADOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las cuentas de administrador no tienen billetera.';
    END IF;
END $$

DELIMITER ;

-- =====================================================================
-- VISTAS (la aplicación las consulta en lugar de armar joins)
-- =====================================================================
CREATE OR REPLACE VIEW v_mision_detalle AS
SELECT m.id_mision, m.titulo, m.descripcion, m.monto_recompensa, m.estado,
       m.fecha_publicacion, m.fecha_cierre,
       m.id_usuario, cu.alias AS alias_usuario,
       m.id_zona, z.nombre AS zona,
       m.id_especialidad, e.nombre AS especialidad,
       m.id_cazarrecompensas, cc.alias AS alias_cazarrecompensas,
       (SELECT COUNT(*) FROM postulacion p WHERE p.id_mision = m.id_mision) AS postulaciones
  FROM mision m
  JOIN cuenta cu       ON cu.id_cuenta = m.id_usuario
  JOIN zona z          ON z.id_zona = m.id_zona
  JOIN especialidad e  ON e.id_especialidad = m.id_especialidad
  LEFT JOIN cuenta cc  ON cc.id_cuenta = m.id_cazarrecompensas;

CREATE OR REPLACE VIEW v_cazarrecompensas_perfil AS
SELECT z.id_cazarrecompensas, c.alias, c.estado AS estado_cuenta, z.biografia,
       z.disponibilidad, z.reputacion, z.id_zona, zo.nombre AS zona,
       fn_misiones_completadas(z.id_cazarrecompensas) AS misiones_completadas,
       (SELECT GROUP_CONCAT(CONCAT(e.nombre, ':', ce.nivel) ORDER BY ce.nivel DESC SEPARATOR ', ')
          FROM cazarrecompensas_especialidad ce
          JOIN especialidad e ON e.id_especialidad = ce.id_especialidad
         WHERE ce.id_cazarrecompensas = z.id_cazarrecompensas) AS especialidades
  FROM cazarrecompensas z
  JOIN cuenta c ON c.id_cuenta = z.id_cazarrecompensas
  JOIN zona zo  ON zo.id_zona = z.id_zona;
