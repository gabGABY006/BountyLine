-- =====================================================================
-- BountyLine - Script de creación de la base de datos relacional
-- Motor: MySQL 8.0 (InnoDB, utf8mb4)
-- Basado en el modelo E-R extendido y en el documento de supuestos.
-- Los códigos Sxx de los comentarios remiten al documento de supuestos.
-- =====================================================================
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS bountyline;
CREATE DATABASE bountyline CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE bountyline;

-- ---------------------------------------------------------------------
-- CUENTA (superclase)
-- ---------------------------------------------------------------------
CREATE TABLE cuenta (
    id_cuenta        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    correo           VARCHAR(120)  NOT NULL,
    alias            VARCHAR(40)   NOT NULL,
    contrasena_hash  VARCHAR(100)  NOT NULL,
    rol              VARCHAR(20)   NOT NULL,
    estado           VARCHAR(15)   NOT NULL DEFAULT 'ACTIVA',
    fecha_registro   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cuenta PRIMARY KEY (id_cuenta),
    CONSTRAINT uq_cuenta_correo UNIQUE (correo),                                   -- S9
    CONSTRAINT uq_cuenta_alias UNIQUE (alias),                                     -- S10
    CONSTRAINT ck_cuenta_rol CHECK (rol IN ('USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR')), -- S12
    CONSTRAINT ck_cuenta_estado CHECK (estado IN ('ACTIVA', 'SUSPENDIDA')),          -- S14
    CONSTRAINT ck_cuenta_correo CHECK (correo LIKE '%_@_%._%')
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- SUBCLASES: la llave primaria es la misma de CUENTA (herencia)
-- ---------------------------------------------------------------------
CREATE TABLE administrador (
    id_administrador INT UNSIGNED NOT NULL,
    nombre           VARCHAR(80)  NOT NULL,
    nivel_acceso     VARCHAR(15)  NOT NULL DEFAULT 'MODERADOR',
    CONSTRAINT pk_administrador PRIMARY KEY (id_administrador),
    CONSTRAINT fk_administrador_cuenta FOREIGN KEY (id_administrador) REFERENCES cuenta (id_cuenta),
    CONSTRAINT ck_administrador_nivel CHECK (nivel_acceso IN ('MODERADOR', 'SUPERVISOR')) -- S31
) ENGINE = InnoDB;

CREATE TABLE usuario (
    id_usuario INT UNSIGNED NOT NULL,
    biografia  VARCHAR(500) NULL,                                                  -- S19
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT fk_usuario_cuenta FOREIGN KEY (id_usuario) REFERENCES cuenta (id_cuenta)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- CATÁLOGOS (gestionados por el administrador, S32)
-- ---------------------------------------------------------------------
CREATE TABLE zona (
    id_zona          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(60)  NOT NULL,
    descripcion      VARCHAR(300) NULL,
    nivel_peligro    TINYINT UNSIGNED NOT NULL,
    id_administrador INT UNSIGNED NOT NULL,
    CONSTRAINT pk_zona PRIMARY KEY (id_zona),
    CONSTRAINT uq_zona_nombre UNIQUE (nombre),
    CONSTRAINT ck_zona_peligro CHECK (nivel_peligro BETWEEN 1 AND 5),               -- S68
    CONSTRAINT fk_zona_administrador FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador)
) ENGINE = InnoDB;

CREATE TABLE especialidad (
    id_especialidad  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(60)  NOT NULL,
    descripcion      VARCHAR(300) NULL,
    id_administrador INT UNSIGNED NOT NULL,
    CONSTRAINT pk_especialidad PRIMARY KEY (id_especialidad),
    CONSTRAINT uq_especialidad_nombre UNIQUE (nombre),
    CONSTRAINT fk_especialidad_administrador FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador)
) ENGINE = InnoDB;

CREATE TABLE cazarrecompensas (
    id_cazarrecompensas INT UNSIGNED NOT NULL,
    id_zona             INT UNSIGNED NOT NULL,                                     -- S25 zona base
    biografia           VARCHAR(500) NULL,
    disponibilidad      VARCHAR(15)  NOT NULL DEFAULT 'DISPONIBLE',
    reputacion          DECIMAL(3,2) NULL,                                         -- S27 derivado
    CONSTRAINT pk_cazarrecompensas PRIMARY KEY (id_cazarrecompensas),
    CONSTRAINT fk_cazarrecompensas_cuenta FOREIGN KEY (id_cazarrecompensas) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_cazarrecompensas_zona FOREIGN KEY (id_zona) REFERENCES zona (id_zona),
    CONSTRAINT ck_cazarrecompensas_disp CHECK (disponibilidad IN ('DISPONIBLE', 'NO_DISPONIBLE')),
    CONSTRAINT ck_cazarrecompensas_rep CHECK (reputacion IS NULL OR reputacion BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- N:M Cazarrecompensas - Especialidad (relación "Domina")
CREATE TABLE cazarrecompensas_especialidad (
    id_cazarrecompensas INT UNSIGNED     NOT NULL,
    id_especialidad     INT UNSIGNED     NOT NULL,
    nivel               TINYINT UNSIGNED NOT NULL,
    CONSTRAINT pk_caz_esp PRIMARY KEY (id_cazarrecompensas, id_especialidad),
    CONSTRAINT fk_caz_esp_caz FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT fk_caz_esp_esp FOREIGN KEY (id_especialidad) REFERENCES especialidad (id_especialidad),
    CONSTRAINT ck_caz_esp_nivel CHECK (nivel BETWEEN 1 AND 5)                       -- S26
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- BILLETERA y MOVIMIENTO
-- ---------------------------------------------------------------------
CREATE TABLE billetera (
    id_billetera        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_cuenta           INT UNSIGNED  NOT NULL,
    saldo_disponible    DECIMAL(12,2) NOT NULL DEFAULT 0,
    saldo_retenido      DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha_actualizacion DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_billetera PRIMARY KEY (id_billetera),
    CONSTRAINT uq_billetera_cuenta UNIQUE (id_cuenta),                              -- S37 1:1
    CONSTRAINT fk_billetera_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta (id_cuenta),
    CONSTRAINT ck_billetera_disp CHECK (saldo_disponible >= 0),                     -- S40
    CONSTRAINT ck_billetera_ret CHECK (saldo_retenido >= 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- MISIÓN y POSTULACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE mision (
    id_mision           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_usuario          INT UNSIGNED  NOT NULL,                                    -- Publica
    id_zona             INT UNSIGNED  NOT NULL,                                    -- Ocurre en
    id_especialidad     INT UNSIGNED  NOT NULL,                                    -- Requiere
    id_cazarrecompensas INT UNSIGNED  NULL,                                        -- Ejecuta
    id_admin_cancela    INT UNSIGNED  NULL,                                        -- Cancela
    titulo              VARCHAR(120)  NOT NULL,
    descripcion         TEXT          NOT NULL,
    monto_recompensa    DECIMAL(12,2) NOT NULL,
    estado              VARCHAR(15)   NOT NULL DEFAULT 'PUBLICADA',
    fecha_publicacion   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre        DATETIME      NULL,
    CONSTRAINT pk_mision PRIMARY KEY (id_mision),
    CONSTRAINT fk_mision_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT fk_mision_zona FOREIGN KEY (id_zona) REFERENCES zona (id_zona),
    CONSTRAINT fk_mision_especialidad FOREIGN KEY (id_especialidad) REFERENCES especialidad (id_especialidad),
    CONSTRAINT fk_mision_cazarrecompensas FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT fk_mision_admin FOREIGN KEY (id_admin_cancela) REFERENCES administrador (id_administrador),
    CONSTRAINT ck_mision_monto CHECK (monto_recompensa > 0),                        -- S51
    CONSTRAINT ck_mision_estado CHECK (estado IN ('PUBLICADA', 'ASIGNADA', 'EN_CURSO', 'CERRADA', 'CANCELADA')),
    CONSTRAINT ck_mision_cierre CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_publicacion)
) ENGINE = InnoDB;

-- N:M Cazarrecompensas - Misión (relación "Se postula")
CREATE TABLE postulacion (
    id_mision           INT UNSIGNED NOT NULL,
    id_cazarrecompensas INT UNSIGNED NOT NULL,
    fecha_postulacion   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mensaje             VARCHAR(500) NULL,
    estado_postulacion  VARCHAR(15)  NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT pk_postulacion PRIMARY KEY (id_mision, id_cazarrecompensas),         -- S57 una vez
    CONSTRAINT fk_postulacion_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT fk_postulacion_caz FOREIGN KEY (id_cazarrecompensas) REFERENCES cazarrecompensas (id_cazarrecompensas),
    CONSTRAINT ck_postulacion_estado CHECK (estado_postulacion IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA'))
) ENGINE = InnoDB;

CREATE TABLE movimiento (
    id_movimiento INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_billetera  INT UNSIGNED  NOT NULL,
    id_mision     INT UNSIGNED  NULL,
    tipo          VARCHAR(12)   NOT NULL,
    monto         DECIMAL(12,2) NOT NULL,
    fecha         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion   VARCHAR(200)  NULL,
    CONSTRAINT pk_movimiento PRIMARY KEY (id_movimiento),
    CONSTRAINT fk_movimiento_billetera FOREIGN KEY (id_billetera) REFERENCES billetera (id_billetera),
    CONSTRAINT fk_movimiento_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT ck_movimiento_tipo CHECK (tipo IN ('RECARGA', 'RETENCION', 'PAGO', 'COBRO', 'REEMBOLSO')), -- S44
    CONSTRAINT ck_movimiento_monto CHECK (monto > 0),                               -- S45
    CONSTRAINT ck_movimiento_mision CHECK ((tipo = 'RECARGA' AND id_mision IS NULL)
                                        OR (tipo <> 'RECARGA' AND id_mision IS NOT NULL)) -- S46, S47
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- CALIFICACIÓN (1:1 con Misión)
-- ---------------------------------------------------------------------
CREATE TABLE calificacion (
    id_calificacion INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    id_mision       INT UNSIGNED     NOT NULL,
    puntaje         TINYINT UNSIGNED NOT NULL,
    comentario      VARCHAR(500)     NULL,
    fecha           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_calificacion PRIMARY KEY (id_calificacion),
    CONSTRAINT uq_calificacion_mision UNIQUE (id_mision),                           -- S63
    CONSTRAINT fk_calificacion_mision FOREIGN KEY (id_mision) REFERENCES mision (id_mision),
    CONSTRAINT ck_calificacion_puntaje CHECK (puntaje BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- REPORTE
-- ---------------------------------------------------------------------
CREATE TABLE reporte (
    id_reporte          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cuenta_reporta   INT UNSIGNED NOT NULL,                                     -- Genera
    id_cuenta_reportada INT UNSIGNED NULL,                                         -- Señala
    id_contenido        VARCHAR(24)  NULL,                                         -- ObjectId de MongoDB
    id_administrador    INT UNSIGNED NULL,                                         -- Atiende
    motivo              VARCHAR(300) NOT NULL,
    estado              VARCHAR(12)  NOT NULL DEFAULT 'PENDIENTE',
    fecha_reporte       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion    DATETIME     NULL,
    CONSTRAINT pk_reporte PRIMARY KEY (id_reporte),
    CONSTRAINT fk_reporte_reporta FOREIGN KEY (id_cuenta_reporta) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_reporte_reportada FOREIGN KEY (id_cuenta_reportada) REFERENCES cuenta (id_cuenta),
    CONSTRAINT fk_reporte_admin FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador),
    CONSTRAINT ck_reporte_estado CHECK (estado IN ('PENDIENTE', 'RESUELTO', 'DESCARTADO')),
    CONSTRAINT ck_reporte_objetivo CHECK ((id_cuenta_reportada IS NULL) <> (id_contenido IS NULL)), -- S72
    CONSTRAINT ck_reporte_pendiente CHECK ((estado = 'PENDIENTE' AND id_administrador IS NULL AND fecha_resolucion IS NULL)
                                        OR (estado <> 'PENDIENTE' AND id_administrador IS NOT NULL AND fecha_resolucion IS NOT NULL)) -- S74
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- AUDITORÍA DE CUENTAS (la llena trg_auditoria_cuenta)
-- ---------------------------------------------------------------------
CREATE TABLE auditoria_cuenta (
    id_auditoria     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cuenta        INT UNSIGNED NOT NULL,
    campo_modificado VARCHAR(30)  NOT NULL,
    valor_anterior   VARCHAR(120) NULL,
    valor_nuevo      VARCHAR(120) NULL,
    fecha_cambio     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_bd       VARCHAR(100) NOT NULL,
    CONSTRAINT pk_auditoria PRIMARY KEY (id_auditoria),
    CONSTRAINT fk_auditoria_cuenta FOREIGN KEY (id_cuenta) REFERENCES cuenta (id_cuenta)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- ÍNDICES para las consultas más frecuentes
-- ---------------------------------------------------------------------
CREATE INDEX ix_mision_estado ON mision (estado, fecha_publicacion);
CREATE INDEX ix_movimiento_billetera_fecha ON movimiento (id_billetera, fecha);
CREATE INDEX ix_reporte_estado ON reporte (estado, fecha_reporte);
CREATE INDEX ix_auditoria_cuenta_fecha ON auditoria_cuenta (id_cuenta, fecha_cambio);
