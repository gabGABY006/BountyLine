-- =====================================================================
-- BountyLine - Script de inserción de datos de prueba
-- Los datos se cargan llamando a los procedimientos almacenados, así que
-- también sirven como prueba de la lógica de negocio.
-- Contraseña de todas las cuentas de prueba: BountyLine2026*
-- (se guarda solo su hash BCrypt, S11)
-- Ejecutar con el usuario administrador de la base de datos.
-- =====================================================================
SET NAMES utf8mb4;
USE bountyline;

-- Administradores (S30: se crean por script)
CALL sp_registrar_administrador('admin@bountyline.gg', 'ADMIN_ROOT', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'Laura Méndez', 'SUPERVISOR', @adm1);
CALL sp_registrar_administrador('moderacion@bountyline.gg', 'MOD_SHADE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'Andrés Pardo', 'MODERADOR', @adm2);

-- Catálogo de zonas (S32, S68)
CALL sp_crear_zona(@adm1, 'Distrito Centro', 'Corazón comercial y financiero de la ciudad.', 3, @z1);
CALL sp_crear_zona(@adm1, 'Puerto', 'Muelles, contenedores y contrabando.', 4, @z2);
CALL sp_crear_zona(@adm1, 'Zona industrial', 'Fábricas abandonadas y talleres clandestinos.', 4, @z3);
CALL sp_crear_zona(@adm1, 'Suburbios', 'Barrios residenciales en la periferia.', 2, @z4);
CALL sp_crear_zona(@adm1, 'Anillo Orbital', 'Estación elevada sobre la ciudad, de acceso restringido.', 5, @z5);

-- Catálogo de especialidades
CALL sp_crear_especialidad(@adm2, 'Recuperación', 'Recuperar créditos, objetos o vehículos robados.', @e1);
CALL sp_crear_especialidad(@adm2, 'Protección', 'Proteger a una persona o un lugar durante un tiempo.', @e2);
CALL sp_crear_especialidad(@adm2, 'Escolta', 'Acompañar un traslado de un punto a otro.', @e3);
CALL sp_crear_especialidad(@adm2, 'Venganza', 'Cobrar una ofensa o una deuda pendiente.', @e4);
CALL sp_crear_especialidad(@adm2, 'Sabotaje', 'Inhabilitar equipos, vehículos o instalaciones.', @e5);

-- Cuentas de Usuario (perfil + billetera en una transacción, S37)
CALL sp_registrar_cuenta('axiom_47@bountyline.gg', 'AXIOM_47', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Jugador del Distrito Centro, siempre con algún problema.', NULL, NULL, @u1);
CALL sp_registrar_cuenta('kira_09@bountyline.gg', 'KIRA_09', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u2);
CALL sp_registrar_cuenta('nova_12@bountyline.gg', 'NOVA_12', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Comerciante del puerto.', NULL, NULL, @u3);
CALL sp_registrar_cuenta('ghost_line@bountyline.gg', 'GHOST_LINE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u4);
CALL sp_registrar_cuenta('neon_rat@bountyline.gg', 'NEON_RAT', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Busco ayuda para recuperar lo mío.', NULL, NULL, @u5);
CALL sp_registrar_cuenta('zero_day@bountyline.gg', 'ZERO_DAY', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u6);
CALL sp_registrar_cuenta('lux_88@bountyline.gg', 'LUX_88', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Coleccionista de piezas raras.', NULL, NULL, @u7);
CALL sp_registrar_cuenta('orbit_7@bountyline.gg', 'ORBIT_7', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u8);
CALL sp_registrar_cuenta('mantis@bountyline.gg', 'MANTIS', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u9);
CALL sp_registrar_cuenta('cipher_3@bountyline.gg', 'CIPHER_3', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Hacker retirado.', NULL, NULL, @u10);
CALL sp_registrar_cuenta('drift_99@bountyline.gg', 'DRIFT_99', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', NULL, NULL, NULL, @u11);
CALL sp_registrar_cuenta('echo_v@bountyline.gg', 'ECHO_V', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'USUARIO', 'Nuevo en la ciudad.', NULL, NULL, @u12);

-- Cuentas de Cazarrecompensas (zona base y especialidades con nivel, S25, S26)
CALL sp_registrar_cuenta('vanta_k@bountyline.gg', 'VANTA_K', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Distrito Centro.', @z1, JSON_ARRAY(JSON_OBJECT('id', @e1, 'nivel', 5), JSON_OBJECT('id', @e4, 'nivel', 3)), @c1);
CALL sp_registrar_cuenta('ronin_x@bountyline.gg', 'RONIN_X', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Puerto.', @z2, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 5), JSON_OBJECT('id', @e3, 'nivel', 4)), @c2);
CALL sp_registrar_cuenta('nightmare@bountyline.gg', 'NIGHTMARE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Zona industrial.', @z3, JSON_ARRAY(JSON_OBJECT('id', @e5, 'nivel', 5), JSON_OBJECT('id', @e1, 'nivel', 2)), @c3);
CALL sp_registrar_cuenta('spectre_8@bountyline.gg', 'SPECTRE_8', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Suburbios.', @z4, JSON_ARRAY(JSON_OBJECT('id', @e4, 'nivel', 5)), @c4);
CALL sp_registrar_cuenta('halo_22@bountyline.gg', 'HALO_22', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Distrito Centro.', @z1, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 4), JSON_OBJECT('id', @e3, 'nivel', 3)), @c5);
CALL sp_registrar_cuenta('jinx_404@bountyline.gg', 'JINX_404', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Zona industrial.', @z3, JSON_ARRAY(JSON_OBJECT('id', @e5, 'nivel', 4), JSON_OBJECT('id', @e4, 'nivel', 2)), @c6);
CALL sp_registrar_cuenta('viper_q@bountyline.gg', 'VIPER_Q', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Puerto.', @z2, JSON_ARRAY(JSON_OBJECT('id', @e1, 'nivel', 4), JSON_OBJECT('id', @e3, 'nivel', 5)), @c7);
CALL sp_registrar_cuenta('onyx@bountyline.gg', 'ONYX', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Anillo Orbital.', @z5, JSON_ARRAY(JSON_OBJECT('id', @e2, 'nivel', 3), JSON_OBJECT('id', @e5, 'nivel', 3)), @c8);
CALL sp_registrar_cuenta('razor_11@bountyline.gg', 'RAZOR_11', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Suburbios.', @z4, JSON_ARRAY(JSON_OBJECT('id', @e4, 'nivel', 4), JSON_OBJECT('id', @e1, 'nivel', 3)), @c9);
CALL sp_registrar_cuenta('sable@bountyline.gg', 'SABLE', '$2a$10$yOjfCkJNUh4C41CUhKQBSu3vdKQsMq7upAsIOgWXtptD2qdK9IawC', 'CAZARRECOMPENSAS', 'Cazarrecompensas con base en Anillo Orbital.', @z5, JSON_ARRAY(JSON_OBJECT('id', @e3, 'nivel', 4), JSON_OBJECT('id', @e2, 'nivel', 2)), @c10);

-- Recargas simuladas (S46)
CALL sp_recargar_saldo(@u1, 50000);
CALL sp_recargar_saldo(@u2, 40000);
CALL sp_recargar_saldo(@u3, 50000);
CALL sp_recargar_saldo(@u4, 60000);
CALL sp_recargar_saldo(@u5, 40000);
CALL sp_recargar_saldo(@u6, 40000);
CALL sp_recargar_saldo(@u7, 60000);
CALL sp_recargar_saldo(@u8, 40000);
CALL sp_recargar_saldo(@u9, 50000);
CALL sp_recargar_saldo(@u10, 60000);
CALL sp_recargar_saldo(@u11, 40000);
CALL sp_recargar_saldo(@u12, 60000);
CALL sp_recargar_saldo(@u1, 15000);
CALL sp_recargar_saldo(@c1, 2000);

-- Misiones: cada publicación retiene el monto (S52)
CALL sp_publicar_mision(@u1, @z2, @e1, 'Recuperar el chip de identidad', 'Detalles de la misión: recuperar el chip de identidad. Más información por el chat.', 2400, @m1);
CALL sp_publicar_mision(@u2, @z5, @e4, 'Saldar cuentas con un ex socio', 'Detalles de la misión: saldar cuentas con un ex socio. Más información por el chat.', 5900, @m2);
CALL sp_publicar_mision(@u3, @z5, @e3, 'Escolta hacia el Puerto Gris', 'Detalles de la misión: escolta hacia el puerto gris. Más información por el chat.', 3200, @m3);
CALL sp_publicar_mision(@u4, @z1, @e2, 'Custodia de testigo en el muelle 4', 'Detalles de la misión: custodia de testigo en el muelle 4. Más información por el chat.', 4800, @m4);
CALL sp_publicar_mision(@u5, @z3, @e4, 'Cobrar el robo de mi apartamento', 'Detalles de la misión: cobrar el robo de mi apartamento. Más información por el chat.', 2400, @m5);
CALL sp_publicar_mision(@u6, @z5, @e3, 'Acompañar un traslado al Anillo Orbital', 'Detalles de la misión: acompañar un traslado al anillo orbital. Más información por el chat.', 2400, @m6);
CALL sp_publicar_mision(@u7, @z5, @e2, 'Vigilar el bar Neón durante el cierre', 'Detalles de la misión: vigilar el bar neón durante el cierre. Más información por el chat.', 1500, @m7);
CALL sp_publicar_mision(@u8, @z5, @e5, 'Cortar la energía del laboratorio', 'Detalles de la misión: cortar la energía del laboratorio. Más información por el chat.', 4800, @m8);
CALL sp_publicar_mision(@u9, @z4, @e4, 'Cobrar una deuda al Clan Hoshi', 'Detalles de la misión: cobrar una deuda al clan hoshi. Más información por el chat.', 8400, @m9);
CALL sp_publicar_mision(@u10, @z3, @e3, 'Escoltar a un informante', 'Detalles de la misión: escoltar a un informante. Más información por el chat.', 9600, @m10);
CALL sp_publicar_mision(@u11, @z5, @e1, 'Rescatar un disco de datos', 'Detalles de la misión: rescatar un disco de datos. Más información por el chat.', 9600, @m11);
CALL sp_publicar_mision(@u12, @z3, @e5, 'Sabotear la grúa del muelle 2', 'Detalles de la misión: sabotear la grúa del muelle 2. Más información por el chat.', 5900, @m12);
CALL sp_publicar_mision(@u1, @z2, @e2, 'Cuidar un envío en la estación', 'Detalles de la misión: cuidar un envío en la estación. Más información por el chat.', 3200, @m13);
CALL sp_publicar_mision(@u2, @z2, @e4, 'Dar una lección al estafador del mercado', 'Detalles de la misión: dar una lección al estafador del mercado. Más información por el chat.', 2400, @m14);
CALL sp_publicar_mision(@u3, @z5, @e1, 'Recuperar créditos del Clan Kuro', 'Detalles de la misión: recuperar créditos del clan kuro. Más información por el chat.', 5900, @m15);
CALL sp_publicar_mision(@u4, @z5, @e5, 'Apagar el generador de la fábrica 9', 'Detalles de la misión: apagar el generador de la fábrica 9. Más información por el chat.', 9600, @m16);
CALL sp_publicar_mision(@u5, @z3, @e5, 'Inhabilitar las cámaras del depósito', 'Detalles de la misión: inhabilitar las cámaras del depósito. Más información por el chat.', 9600, @m17);
CALL sp_publicar_mision(@u6, @z3, @e2, 'Proteger mi taller esta noche', 'Detalles de la misión: proteger mi taller esta noche. Más información por el chat.', 2400, @m18);
CALL sp_publicar_mision(@u7, @z1, @e5, 'Desactivar el sistema de alarmas', 'Detalles de la misión: desactivar el sistema de alarmas. Más información por el chat.', 8400, @m19);
CALL sp_publicar_mision(@u8, @z2, @e5, 'Bloquear la señal de un dron', 'Detalles de la misión: bloquear la señal de un dron. Más información por el chat.', 7200, @m20);
CALL sp_publicar_mision(@u9, @z2, @e3, 'Mover un contenedor sellado', 'Detalles de la misión: mover un contenedor sellado. Más información por el chat.', 9600, @m21);
CALL sp_publicar_mision(@u10, @z4, @e1, 'Devolver mi moto robada', 'Detalles de la misión: devolver mi moto robada. Más información por el chat.', 1500, @m22);
CALL sp_publicar_mision(@u11, @z1, @e1, 'Cargamento perdido en el anillo industrial', 'Detalles de la misión: cargamento perdido en el anillo industrial. Más información por el chat.', 7200, @m23);
CALL sp_publicar_mision(@u12, @z3, @e2, 'Proteger una caravana en los suburbios', 'Detalles de la misión: proteger una caravana en los suburbios. Más información por el chat.', 7200, @m24);

-- Postulaciones, asignaciones, inicio, cierre y cancelaciones
CALL sp_postular(@m1, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m1, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m1, @c8, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m1, @u1, @c1);
CALL sp_iniciar_mision(@m1, @c1);
CALL sp_cerrar_mision(@m1, @u1);
CALL sp_postular(@m2, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m2, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m2, @c7, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m2, @u2, @c1);
CALL sp_iniciar_mision(@m2, @c1);
CALL sp_cerrar_mision(@m2, @u2);
CALL sp_postular(@m3, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m3, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m3, @c8, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m3, @u3, @c2);
CALL sp_iniciar_mision(@m3, @c2);
CALL sp_cerrar_mision(@m3, @u3);
CALL sp_postular(@m4, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m4, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m4, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m4, @u4, @c2);
CALL sp_iniciar_mision(@m4, @c2);
CALL sp_cerrar_mision(@m4, @u4);
CALL sp_postular(@m5, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m5, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m5, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m5, @u5, @c1);
CALL sp_iniciar_mision(@m5, @c1);
CALL sp_cerrar_mision(@m5, @u5);
CALL sp_postular(@m6, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m6, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m6, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m6, @u6, @c2);
CALL sp_iniciar_mision(@m6, @c2);
CALL sp_cerrar_mision(@m6, @u6);
CALL sp_postular(@m7, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m7, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m7, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m7, @u7, @c2);
CALL sp_iniciar_mision(@m7, @c2);
CALL sp_cerrar_mision(@m7, @u7);
CALL sp_postular(@m8, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m8, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m8, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m8, @u8, @c3);
CALL sp_iniciar_mision(@m8, @c3);
CALL sp_cerrar_mision(@m8, @u8);
CALL sp_postular(@m9, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m9, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m9, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m9, @u9, @c1);
CALL sp_iniciar_mision(@m9, @c1);
CALL sp_cerrar_mision(@m9, @u9);
CALL sp_postular(@m10, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m10, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m10, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m10, @u10, @c2);
CALL sp_iniciar_mision(@m10, @c2);
CALL sp_cerrar_mision(@m10, @u10);
CALL sp_postular(@m11, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m11, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m11, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m11, @u11, @c1);
CALL sp_iniciar_mision(@m11, @c1);
CALL sp_postular(@m12, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m12, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m12, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m12, @u12, @c3);
CALL sp_iniciar_mision(@m12, @c3);
CALL sp_postular(@m13, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m13, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m13, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m13, @u1, @c2);
CALL sp_iniciar_mision(@m13, @c2);
CALL sp_postular(@m14, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m14, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m14, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m14, @u2, @c1);
CALL sp_postular(@m15, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m15, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m15, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m15, @u3, @c1);
CALL sp_postular(@m16, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m16, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m16, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_asignar_cazarrecompensas(@m16, @u4, @c3);
CALL sp_postular(@m17, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m17, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m17, @c7, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m18, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m19, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m20, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m21, @c4, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m22, @c10, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m22, NULL, @adm2);
CALL sp_postular(@m23, @c1, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m23, @c3, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m23, @c6, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m23, @u11, NULL);
CALL sp_postular(@m24, @c2, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m24, @c5, 'Puedo encargarme, conozco la zona.');
CALL sp_postular(@m24, @c9, 'Puedo encargarme, conozco la zona.');
CALL sp_cancelar_mision(@m24, NULL, @adm2);

-- Calificaciones de misiones cerradas (S62, S63); actualizan la reputación por trigger
CALL sp_calificar_mision(@m1, @u1, 4, 'Rápido y sin problemas.');
CALL sp_calificar_mision(@m2, @u2, 3, 'Cumplió, aunque tardó un poco.');
CALL sp_calificar_mision(@m3, @u3, 5, NULL);
CALL sp_calificar_mision(@m4, @u4, 4, 'Excelente trabajo.');
CALL sp_calificar_mision(@m5, @u5, 4, 'Muy profesional.');
CALL sp_calificar_mision(@m6, @u6, 5, NULL);
CALL sp_calificar_mision(@m7, @u7, 3, 'Recomendado.');
CALL sp_calificar_mision(@m8, @u8, 5, 'Bien.');
CALL sp_calificar_mision(@m9, @u9, 3, 'Lo volvería a contratar.');

-- Reportes (S72, S74) y su atención por un administrador (S33, S35)
CALL sp_crear_reporte(@u2, @c6, NULL, 'Amenazas por el chat de la misión.', @r1);
CALL sp_crear_reporte(@u5, NULL, '665f1c2a9b3e4d0012ab34cd', 'Publicación con datos personales de otro jugador.', @r2);
CALL sp_crear_reporte(@c3, @u9, NULL, 'Intento de fraude con la recompensa.', @r3);
CALL sp_crear_reporte(@u7, NULL, '665f1c2a9b3e4d0012ab34d1', 'Comentario ofensivo.', @r4);
CALL sp_resolver_reporte(@r1, @adm2, 'RESUELTO', TRUE);
CALL sp_resolver_reporte(@r2, @adm2, 'RESUELTO', FALSE);
CALL sp_resolver_reporte(@r3, @adm1, 'DESCARTADO', FALSE);

-- Cambio de correo para dejar evidencia en la auditoría (S76)
UPDATE cuenta SET correo = 'kira.09@bountyline.gg' WHERE id_cuenta = @u2;

-- Resumen
SELECT 'cuenta' AS tabla, COUNT(*) AS registros FROM cuenta UNION ALL SELECT 'mision', COUNT(*) FROM mision UNION ALL SELECT 'postulacion', COUNT(*) FROM postulacion UNION ALL SELECT 'movimiento', COUNT(*) FROM movimiento UNION ALL SELECT 'calificacion', COUNT(*) FROM calificacion UNION ALL SELECT 'reporte', COUNT(*) FROM reporte UNION ALL SELECT 'auditoria_cuenta', COUNT(*) FROM auditoria_cuenta;
