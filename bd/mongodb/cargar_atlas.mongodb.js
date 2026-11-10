/* global use, db, print, NumberInt, ObjectId, ISODate */
// =====================================================================
// BountyLine - MongoDB: carga completa para MongoDB Atlas desde VS Code
// Crea la base bountyline con sus colecciones, validadores e índices y
// carga los datos de prueba. Es lo mismo que 01_colecciones.js y
// 02_insercion.js juntos, en formato de Playground.
// Uso: abrir este archivo en VS Code con la extensión de MongoDB,
// conectarse al cluster y darle "Run" (el triángulo de arriba a la derecha).
// Si se vuelve a ejecutar, borra la base y la crea de nuevo.
// =====================================================================
use('bountyline');
db.dropDatabase();

// ---------------------------------------------------------------------
// publicaciones: un documento por publicación del feed, con sus
// comentarios y reacciones embebidos (S81). Solo texto (S80).
// ---------------------------------------------------------------------
db.createCollection('publicaciones', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id_cuenta', 'alias', 'rol', 'texto', 'etiquetas', 'reacciones', 'comentarios',
                 'estado_moderacion', 'fecha_publicacion'],
      properties: {
        id_cuenta: { bsonType: 'int', minimum: 1, description: 'id_cuenta del autor en MySQL' },
        alias: { bsonType: 'string', minLength: 3, maxLength: 40 },
        rol: { enum: ['USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR'] },
        texto: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        etiquetas: { bsonType: 'array', maxItems: 10, uniqueItems: true,
                     items: { bsonType: 'string', pattern: '^[a-z0-9_]{2,30}$' } },
        id_zona: { bsonType: ['int', 'null'], minimum: 1 },
        zona: { bsonType: ['string', 'null'] },
        id_mision: { bsonType: ['int', 'null'], minimum: 1, description: 'misión de MySQL a la que se refiere, opcional' },
        reacciones: {
          bsonType: 'object',
          required: ['me_gusta', 'fuego', 'alerta'],
          properties: {
            me_gusta: { bsonType: 'int', minimum: 0 },
            fuego: { bsonType: 'int', minimum: 0 },
            alerta: { bsonType: 'int', minimum: 0 }
          }
        },
        reaccionaron: {
          bsonType: 'array',
          description: 'quién reaccionó y con qué tipo; una reacción por cuenta',
          items: {
            bsonType: 'object',
            required: ['id_cuenta', 'tipo'],
            properties: {
              id_cuenta: { bsonType: 'int', minimum: 1 },
              tipo: { enum: ['me_gusta', 'fuego', 'alerta'] }
            }
          }
        },
        comentarios: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['_id', 'id_cuenta', 'alias', 'texto', 'fecha', 'estado_moderacion'],
            properties: {
              _id: { bsonType: 'objectId' },
              id_cuenta: { bsonType: 'int', minimum: 1 },
              alias: { bsonType: 'string' },
              texto: { bsonType: 'string', minLength: 1, maxLength: 500 },
              fecha: { bsonType: 'date' },
              estado_moderacion: { enum: ['VISIBLE', 'OCULTO'] }
            }
          }
        },
        estado_moderacion: { enum: ['VISIBLE', 'OCULTA'] },
        fecha_publicacion: { bsonType: 'date' },
        fecha_edicion: { bsonType: ['date', 'null'] }
      }
    }
  }
});
db.publicaciones.createIndex({ fecha_publicacion: -1 }, { name: 'ix_pub_fecha' });
db.publicaciones.createIndex({ etiquetas: 1, fecha_publicacion: -1 }, { name: 'ix_pub_etiquetas' });
db.publicaciones.createIndex({ id_zona: 1, fecha_publicacion: -1 }, { name: 'ix_pub_zona' });
db.publicaciones.createIndex({ id_cuenta: 1, fecha_publicacion: -1 }, { name: 'ix_pub_autor' });
db.publicaciones.createIndex({ id_mision: 1 }, { name: 'ix_pub_mision', sparse: true });
db.publicaciones.createIndex({ 'comentarios._id': 1 }, { name: 'ix_pub_comentario' });
db.publicaciones.createIndex({ texto: 'text', etiquetas: 'text' },
  { name: 'tx_pub_texto', default_language: 'spanish', weights: { etiquetas: 3, texto: 1 } });

// ---------------------------------------------------------------------
// mensajes_chat: un documento por mensaje para que ningún documento
// crezca sin límite. Chat solo de texto entre el usuario y el
// cazarrecompensas asignado a la misión (S82, S83).
// ---------------------------------------------------------------------
db.createCollection('mensajes_chat', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id_mision', 'id_emisor', 'alias_emisor', 'rol_emisor', 'texto', 'fecha', 'leido'],
      properties: {
        id_mision: { bsonType: 'int', minimum: 1 },
        id_emisor: { bsonType: 'int', minimum: 1 },
        alias_emisor: { bsonType: 'string' },
        rol_emisor: { enum: ['USUARIO', 'CAZARRECOMPENSAS'] },
        texto: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        fecha: { bsonType: 'date' },
        leido: { bsonType: 'bool' }
      }
    }
  }
});
db.mensajes_chat.createIndex({ id_mision: 1, fecha: 1 }, { name: 'ix_chat_mision_fecha' });
db.mensajes_chat.createIndex({ id_emisor: 1, fecha: -1 }, { name: 'ix_chat_emisor' });

// ---------------------------------------------------------------------
// bitacora_actividad: eventos de uso (S84). Cada tipo trae campos
// distintos; solo se validan los comunes.
// ---------------------------------------------------------------------
db.createCollection('bitacora_actividad', {
  validationLevel: 'strict',
  validationAction: 'error',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tipo', 'id_cuenta', 'fecha'],
      properties: {
        tipo: { enum: ['INICIO_SESION', 'CIERRE_SESION', 'BUSQUEDA', 'VISTA_MISION', 'VISTA_PERFIL', 'PUBLICACION'] },
        id_cuenta: { bsonType: 'int', minimum: 1 },
        rol: { enum: ['USUARIO', 'CAZARRECOMPENSAS', 'ADMINISTRADOR'] },
        fecha: { bsonType: 'date' },
        exito: { bsonType: 'bool' },
        pantalla: { bsonType: 'string' },
        filtros: { bsonType: 'object' },
        resultados: { bsonType: 'int', minimum: 0 },
        id_mision: { bsonType: 'int', minimum: 1 },
        id_cuenta_vista: { bsonType: 'int', minimum: 1 },
        id_publicacion: { bsonType: 'objectId' }
      }
    }
  }
});
db.bitacora_actividad.createIndex({ id_cuenta: 1, fecha: -1 }, { name: 'ix_bit_cuenta' });
db.bitacora_actividad.createIndex({ tipo: 1, fecha: -1 }, { name: 'ix_bit_tipo' });

print('Colecciones creadas: ' + db.getCollectionNames().sort().join(', '));


db.publicaciones.insertMany([
  {
    _id: ObjectId("6730a1b2c3d4e5f600000001"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien sabe quién maneja el contrabando en los muelles esta semana? Hay movimiento raro.",
    etiquetas: ["puerto", "contrabando"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(8), fuego: NumberInt(0), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(8), tipo: 'alerta' }, { id_cuenta: NumberInt(6), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'me_gusta' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(5), tipo: 'me_gusta' }, { id_cuenta: NumberInt(20), tipo: 'me_gusta' }, { id_cuenta: NumberInt(4), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000002"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Te escribo por privado.", fecha: ISODate("2026-11-05T00:32:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-03T15:32:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000003"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Busco cazarrecompensas con experiencia en escoltas hacia el Anillo Orbital. Pago justo.",
    etiquetas: ["escolta", "anillo_orbital"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(19), tipo: 'alerta' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'fuego' }, { id_cuenta: NumberInt(5), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000004"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Te escribo por privado.", fecha: ISODate("2026-10-26T10:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000005"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Te escribo por privado.", fecha: ISODate("2026-10-25T21:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000006"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Cuidado con eso.", fecha: ISODate("2026-10-26T09:37:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000007"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Eso no es cierto.", fecha: ISODate("2026-10-25T21:37:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-25T15:37:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000008"),
    id_cuenta: NumberInt(5), alias: "NOVA_12", rol: 'USUARIO',
    texto: "Ojo con los drones de vigilancia nuevos en la zona industrial, detectan calor.",
    etiquetas: ["alerta", "zona_industrial"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: NumberInt(7),
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(4), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(15), tipo: 'fuego' }, { id_cuenta: NumberInt(1), tipo: 'fuego' }, { id_cuenta: NumberInt(2), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'fuego' }, { id_cuenta: NumberInt(5), tipo: 'fuego' }, { id_cuenta: NumberInt(21), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'alerta' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-06T21:43:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000009"),
    id_cuenta: NumberInt(6), alias: "GHOST_LINE", rol: 'USUARIO',
    texto: "Terminé una misión de recuperación sin un rasguño. Gracias VANTA_K.",
    etiquetas: ["recuperacion", "recomendado"],
    id_zona: null, zona: null,
    id_mision: NumberInt(2),
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(6), tipo: 'fuego' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'alerta' }, { id_cuenta: NumberInt(11), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000000a"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-13T23:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000b"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-14T16:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000c"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Cuidado con eso.", fecha: ISODate("2026-10-13T20:45:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-13T11:45:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000000d"),
    id_cuenta: NumberInt(4), alias: "KIRA_09", rol: 'USUARIO',
    texto: "Los suburbios están tranquilos de noche, pero no confíen en las cámaras del metro.",
    etiquetas: ["suburbios", "seguridad"],
    id_zona: NumberInt(4), zona: "Suburbios",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'alerta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000000e"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Cuidado con eso.", fecha: ISODate("2026-10-15T06:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000000f"), id_cuenta: NumberInt(5), alias: "NOVA_12", texto: "Gracias por el dato.", fecha: ISODate("2026-10-14T16:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000010"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-16T01:28:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000011"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-16T02:28:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-14T11:28:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000012"),
    id_cuenta: NumberInt(10), alias: "ORBIT_7", rol: 'USUARIO',
    texto: "Nueva ruta de suministro por el Distrito Centro, menos patrullas después de las 22:00.",
    etiquetas: ["distrito_centro", "rutas"],
    id_zona: NumberInt(1), zona: "Distrito Centro",
    id_mision: NumberInt(21),
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(2), tipo: 'fuego' }, { id_cuenta: NumberInt(1), tipo: 'alerta' }, { id_cuenta: NumberInt(15), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000013"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Te escribo por privado.", fecha: ISODate("2026-10-21T20:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000014"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Cuidado con eso.", fecha: ISODate("2026-10-21T01:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000015"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Gracias por el dato.", fecha: ISODate("2026-10-21T02:12:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000016"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Eso no es cierto.", fecha: ISODate("2026-10-22T04:12:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-20T19:12:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000017"),
    id_cuenta: NumberInt(12), alias: "CIPHER_3", rol: 'USUARIO',
    texto: "El Clan Kuro está cobrando peaje en el puerto. Si van a pasar, vayan en grupo.",
    etiquetas: ["puerto", "clanes", "alerta"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("665f1c2a9b3e4d0012ab34d1"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Cállate, nadie te preguntó. (comentario reportado)", fecha: ISODate("2026-11-07T13:59:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-07T10:59:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000018"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "Vendo mapa de los túneles de mantenimiento del anillo. Solo créditos.",
    etiquetas: ["anillo_orbital", "mapas"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: NumberInt(14),
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(14), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000019"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-18T23:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001a"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-19T14:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001b"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Yo también lo vi.", fecha: ISODate("2026-10-20T08:01:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-18T19:01:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000001c"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien más perdió conexión en el sector 7? Parece sabotaje.",
    etiquetas: ["sabotaje", "zona_industrial"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(3), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(5), tipo: 'fuego' }, { id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }, { id_cuenta: NumberInt(2), tipo: 'fuego' }, { id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(17), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000001d"), id_cuenta: NumberInt(7), alias: "NEON_RAT", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-28T08:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001e"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-28T01:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000001f"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-27T14:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000020"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Gracias por el dato.", fecha: ISODate("2026-10-28T09:46:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-26T18:46:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000021"),
    id_cuenta: NumberInt(5), alias: "NOVA_12", rol: 'USUARIO',
    texto: "Primer día como cazarrecompensas. Consejos para conseguir buenas calificaciones?",
    etiquetas: ["novato", "consejos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(3), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(2), tipo: 'alerta' }, { id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'fuego' }, { id_cuenta: NumberInt(17), tipo: 'me_gusta' }, { id_cuenta: NumberInt(22), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000022"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Cuidado con eso.", fecha: ISODate("2026-11-02T12:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000023"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-11-02T10:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000024"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Gracias por el dato.", fecha: ISODate("2026-11-01T01:01:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000025"), id_cuenta: NumberInt(5), alias: "NOVA_12", texto: "Eso no es cierto.", fecha: ISODate("2026-11-01T04:01:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-31T20:01:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000026"),
    id_cuenta: NumberInt(3), alias: "AXIOM_47", rol: 'USUARIO',
    texto: "Tip: siempre pidan que la misión quede ASIGNADA antes de moverse. Así el pago está retenido.",
    etiquetas: ["consejos", "pagos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(1), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(13), tipo: 'alerta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000027"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Eso no es cierto.", fecha: ISODate("2026-10-21T03:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000028"), id_cuenta: NumberInt(3), alias: "AXIOM_47", texto: "Eso no es cierto.", fecha: ISODate("2026-10-20T19:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000029"), id_cuenta: NumberInt(7), alias: "NEON_RAT", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-21T11:07:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002a"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-20T06:07:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-19T19:07:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000002b"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "El generador de la fábrica 9 vuelve a fallar. Atentos a los apagones.",
    etiquetas: ["zona_industrial", "energia"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(11), tipo: 'me_gusta' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-05T13:53:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000002c"),
    id_cuenta: NumberInt(6), alias: "GHOST_LINE", rol: 'USUARIO',
    texto: "Recomiendo a RONIN_X para escoltas, puntual y discreto.",
    etiquetas: ["escolta", "recomendado"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000002d"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Te escribo por privado.", fecha: ISODate("2026-11-04T01:17:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002e"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Excelente aporte.", fecha: ISODate("2026-11-03T12:17:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000002f"), id_cuenta: NumberInt(17), alias: "NIGHTMARE", texto: "Gracias por el dato.", fecha: ISODate("2026-11-03T12:17:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-02T15:17:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000030"),
    id_cuenta: NumberInt(11), alias: "MANTIS", rol: 'USUARIO',
    texto: "Hay una banda robando motos cerca del mercado del Distrito Centro.",
    etiquetas: ["distrito_centro", "robos", "alerta"],
    id_zona: NumberInt(1), zona: "Distrito Centro",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(9), tipo: 'alerta' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'me_gusta' }, { id_cuenta: NumberInt(4), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000031"), id_cuenta: NumberInt(12), alias: "CIPHER_3", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-09T07:45:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000032"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Cuidado con eso.", fecha: ISODate("2026-10-08T03:45:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-07T18:45:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000033"),
    id_cuenta: NumberInt(11), alias: "MANTIS", rol: 'USUARIO',
    texto: "Se busca información sobre el informante del muelle 4. Recompensa alta.",
    etiquetas: ["puerto", "informantes"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(5), tipo: 'alerta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(2), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000034"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Yo también lo vi.", fecha: ISODate("2026-10-16T22:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000035"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-17T13:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000036"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-18T05:00:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000037"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Cuidado con eso.", fecha: ISODate("2026-10-17T06:00:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T19:00:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000038"),
    id_cuenta: NumberInt(17), alias: "NIGHTMARE", rol: 'CAZARRECOMPENSAS',
    texto: "Las misiones de venganza no son para cualquiera. Lean bien antes de postularse.",
    etiquetas: ["venganza", "consejos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(9), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000039"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-19T07:56:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003a"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-19T00:56:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003b"), id_cuenta: NumberInt(23), alias: "RAZOR_11", texto: "Gracias por el dato.", fecha: ISODate("2026-10-18T08:56:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-17T18:56:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000003c"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Hoy cerramos tres misiones en el Anillo Orbital. Buen ritmo, equipo.",
    etiquetas: ["anillo_orbital", "logros"],
    id_zona: NumberInt(5), zona: "Anillo Orbital",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(1), alerta: NumberInt(2) },
    reaccionaron: [{ id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(20), tipo: 'alerta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'fuego' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'alerta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000003d"), id_cuenta: NumberInt(11), alias: "MANTIS", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-10T14:34:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000003e"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-10-10T18:34:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-10T12:34:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000003f"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "Cuidado con quien pide pagos por fuera de la plataforma, es estafa segura.",
    etiquetas: ["estafas", "alerta"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(19), tipo: 'fuego' }, { id_cuenta: NumberInt(20), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000040"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Gracias por el dato.", fecha: ISODate("2026-11-09T12:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000041"), id_cuenta: NumberInt(10), alias: "ORBIT_7", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-11-09T03:46:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000042"), id_cuenta: NumberInt(20), alias: "JINX_404", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-11-08T17:46:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-07T22:46:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000043"),
    id_cuenta: NumberInt(24), alias: "SABLE", rol: 'CAZARRECOMPENSAS',
    texto: "Alguien tiene repuestos para un dron de carga modelo K-12?",
    etiquetas: ["drones", "repuestos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(0), alerta: NumberInt(3) },
    reaccionaron: [{ id_cuenta: NumberInt(11), tipo: 'me_gusta' }, { id_cuenta: NumberInt(21), tipo: 'alerta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'alerta' }, { id_cuenta: NumberInt(20), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'alerta' }, { id_cuenta: NumberInt(19), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000044"), id_cuenta: NumberInt(12), alias: "CIPHER_3", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-30T07:55:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-29T21:55:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000045"),
    id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", rol: 'ADMINISTRADOR',
    texto: "La zona industrial necesita más protección nocturna. Hay trabajo para todos.",
    etiquetas: ["zona_industrial", "proteccion"],
    id_zona: NumberInt(3), zona: "Zona industrial",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(6), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(13), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(22), tipo: 'me_gusta' }, { id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(11), tipo: 'fuego' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000046"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-16T03:59:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000047"), id_cuenta: NumberInt(18), alias: "SPECTRE_8", texto: "Yo también lo vi.", fecha: ISODate("2026-10-16T17:59:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000048"), id_cuenta: NumberInt(13), alias: "DRIFT_99", texto: "Te escribo por privado.", fecha: ISODate("2026-10-16T13:59:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-15T09:59:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000049"),
    id_cuenta: NumberInt(2), alias: "MOD_SHADE", rol: 'ADMINISTRADOR',
    texto: "Mi taller fue saqueado anoche. Publicaré una misión de protección.",
    etiquetas: ["proteccion", "robos"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(5), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(3), tipo: 'me_gusta' }, { id_cuenta: NumberInt(15), tipo: 'me_gusta' }, { id_cuenta: NumberInt(23), tipo: 'me_gusta' }, { id_cuenta: NumberInt(16), tipo: 'me_gusta' }, { id_cuenta: NumberInt(19), tipo: 'me_gusta' }, { id_cuenta: NumberInt(8), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000004a"), id_cuenta: NumberInt(2), alias: "MOD_SHADE", texto: "Gracias por el dato.", fecha: ISODate("2026-10-29T01:39:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000004b"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Eso no es cierto.", fecha: ISODate("2026-10-29T03:39:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000004c"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-28T00:39:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-27T11:39:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000004d"),
    id_cuenta: NumberInt(8), alias: "ZERO_DAY", rol: 'USUARIO',
    texto: "Busco equipo para una misión de sabotaje coordinada. Escríbanme por chat cuando asigne.",
    etiquetas: ["sabotaje", "equipo"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(1), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(10), tipo: 'me_gusta' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000004e"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Gracias por el dato.", fecha: ISODate("2026-10-26T06:20:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-25T17:20:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000004f"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Resumen de la semana: más misiones de escolta que nunca.",
    etiquetas: ["escolta", "estadisticas"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(4), fuego: NumberInt(0), alerta: NumberInt(1) },
    reaccionaron: [{ id_cuenta: NumberInt(19), tipo: 'me_gusta' }, { id_cuenta: NumberInt(24), tipo: 'me_gusta' }, { id_cuenta: NumberInt(9), tipo: 'me_gusta' }, { id_cuenta: NumberInt(5), tipo: 'alerta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000050"), id_cuenta: NumberInt(1), alias: "ADMIN_ROOT", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-11T23:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000051"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Gracias por el dato.", fecha: ISODate("2026-10-11T16:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000052"), id_cuenta: NumberInt(9), alias: "LUX_88", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-13T03:53:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000053"), id_cuenta: NumberInt(14), alias: "ECHO_V", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-11T22:53:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-11T14:53:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000054"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "El puerto amaneció con niebla tóxica, eviten el muelle 2.",
    etiquetas: ["puerto", "alerta"],
    id_zona: NumberInt(2), zona: "Puerto",
    id_mision: NumberInt(6),
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(1), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(6), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000055"), id_cuenta: NumberInt(24), alias: "SABLE", texto: "Excelente aporte.", fecha: ISODate("2026-10-16T16:13:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f700000056"), id_cuenta: NumberInt(4), alias: "KIRA_09", texto: "Te escribo por privado.", fecha: ISODate("2026-10-16T18:13:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T09:13:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000057"),
    id_cuenta: NumberInt(15), alias: "VANTA_K", rol: 'CAZARRECOMPENSAS',
    texto: "Gracias a todos por las calificaciones, ya llegué a reputación 4.5.",
    etiquetas: ["logros", "reputacion"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f700000058"), id_cuenta: NumberInt(22), alias: "ONYX", texto: "Totalmente de acuerdo.", fecha: ISODate("2026-11-04T14:32:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-11-03T14:32:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f600000059"),
    id_cuenta: NumberInt(9), alias: "LUX_88", rol: 'USUARIO',
    texto: "Alguien recomienda una ruta segura entre suburbios y el centro?",
    etiquetas: ["suburbios", "rutas"],
    id_zona: NumberInt(4), zona: "Suburbios",
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
    reaccionaron: [],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000005a"), id_cuenta: NumberInt(15), alias: "VANTA_K", texto: "Excelente aporte.", fecha: ISODate("2026-10-17T03:29:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005b"), id_cuenta: NumberInt(8), alias: "ZERO_DAY", texto: "Confirmo, pasó ayer.", fecha: ISODate("2026-10-16T21:29:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T14:29:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("665f1c2a9b3e4d0012ab34cd"),
    id_cuenta: NumberInt(7), alias: "NEON_RAT", rol: 'USUARIO',
    texto: "Publico datos de contacto de un jugador que me estafó: (eliminado por moderación)",
    etiquetas: ["estafas"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(2), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(15), tipo: 'fuego' }, { id_cuenta: NumberInt(7), tipo: 'fuego' }],
    comentarios: [
      { _id: ObjectId("6730a1b2c3d4e5f70000005c"), id_cuenta: NumberInt(21), alias: "VIPER_Q", texto: "Cuenta conmigo.", fecha: ISODate("2026-10-27T13:05:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005d"), id_cuenta: NumberInt(19), alias: "HALO_22", texto: "Muy útil, gracias.", fecha: ISODate("2026-10-27T12:05:00.000Z"), estado_moderacion: 'VISIBLE' },
      { _id: ObjectId("6730a1b2c3d4e5f70000005e"), id_cuenta: NumberInt(11), alias: "MANTIS", texto: "Gracias por el dato.", fecha: ISODate("2026-10-26T16:05:00.000Z"), estado_moderacion: 'VISIBLE' }
    ],
    estado_moderacion: 'OCULTA',
    fecha_publicacion: ISODate("2026-10-25T22:05:00.000Z"),
    fecha_edicion: null
  },
  {
    _id: ObjectId("6730a1b2c3d4e5f60000005f"),
    id_cuenta: NumberInt(16), alias: "RONIN_X", rol: 'CAZARRECOMPENSAS',
    texto: "Novedades: las recargas de créditos ya están funcionando bien otra vez.",
    etiquetas: ["pagos", "novedades"],
    id_zona: null, zona: null,
    id_mision: null,
    reacciones: { me_gusta: NumberInt(2), fuego: NumberInt(3), alerta: NumberInt(0) },
    reaccionaron: [{ id_cuenta: NumberInt(12), tipo: 'me_gusta' }, { id_cuenta: NumberInt(18), tipo: 'me_gusta' }, { id_cuenta: NumberInt(6), tipo: 'fuego' }, { id_cuenta: NumberInt(3), tipo: 'fuego' }, { id_cuenta: NumberInt(14), tipo: 'fuego' }],
    comentarios: [],
    estado_moderacion: 'VISIBLE',
    fecha_publicacion: ISODate("2026-10-16T14:13:00.000Z"),
    fecha_edicion: null
  }
]);

db.mensajes_chat.insertMany([
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-06T18:27:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Recibido, ya revisé la zona.", fecha: ISODate("2026-10-06T19:42:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-06T20:53:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-06T21:45:00.000Z"), leido: true },
  { id_mision: NumberInt(1), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-06T22:51:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-07T17:18:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-07T18:11:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-07T18:16:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-07T19:37:00.000Z"), leido: true },
  { id_mision: NumberInt(2), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-07T20:10:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-08T17:54:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-08T18:03:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-08T18:31:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-08T19:22:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-08T19:37:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-08T20:12:00.000Z"), leido: true },
  { id_mision: NumberInt(3), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-08T20:58:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-09T18:08:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-09T19:17:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-09T19:32:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-09T20:31:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-09T21:56:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-09T23:09:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-10T00:37:00.000Z"), leido: true },
  { id_mision: NumberInt(4), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-10T00:45:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-10T17:52:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-10T18:16:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-10T19:22:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-10T20:43:00.000Z"), leido: true },
  { id_mision: NumberInt(5), id_emisor: NumberInt(7), alias_emisor: "NEON_RAT", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-10T20:53:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-11T17:56:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-11T19:06:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-11T20:25:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-11T21:14:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-11T21:53:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-11T23:19:00.000Z"), leido: true },
  { id_mision: NumberInt(6), id_emisor: NumberInt(8), alias_emisor: "ZERO_DAY", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-12T00:33:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-12T17:40:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-12T17:44:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-12T18:18:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-12T18:26:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-12T18:49:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-12T20:19:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-12T20:28:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-12T21:21:00.000Z"), leido: true },
  { id_mision: NumberInt(7), id_emisor: NumberInt(9), alias_emisor: "LUX_88", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-12T22:38:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-13T17:12:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Todo despejado por ahora.", fecha: ISODate("2026-10-13T17:43:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-13T18:47:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-13T19:21:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(10), alias_emisor: "ORBIT_7", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-13T20:30:00.000Z"), leido: true },
  { id_mision: NumberInt(8), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-13T21:32:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-14T17:34:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-14T17:51:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-14T19:13:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-14T20:14:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-14T20:43:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-14T20:52:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-14T22:02:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-14T22:20:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(11), alias_emisor: "MANTIS", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-14T23:19:00.000Z"), leido: true },
  { id_mision: NumberInt(9), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-15T00:47:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-15T18:19:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-15T19:43:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-15T21:13:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-15T22:02:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-15T23:12:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-15T23:32:00.000Z"), leido: true },
  { id_mision: NumberInt(10), id_emisor: NumberInt(12), alias_emisor: "CIPHER_3", rol_emisor: 'USUARIO', texto: "Gracias, cierro la misión y te califico.", fecha: ISODate("2026-10-15T23:51:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T17:17:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-16T17:59:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T19:06:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-16T19:54:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Avísame cuando termines.", fecha: ISODate("2026-10-16T20:31:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-16T22:01:00.000Z"), leido: true },
  { id_mision: NumberInt(11), id_emisor: NumberInt(13), alias_emisor: "DRIFT_99", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-16T23:16:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-17T17:27:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-17T18:05:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-17T18:38:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Listo, misión completada.", fecha: ISODate("2026-10-17T19:12:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-17T20:38:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-17T22:08:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(14), alias_emisor: "ECHO_V", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-17T23:31:00.000Z"), leido: true },
  { id_mision: NumberInt(12), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-17T23:35:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Hola, ya estás en camino?", fecha: ISODate("2026-10-18T17:57:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Voy saliendo, llego en 30 minutos.", fecha: ISODate("2026-10-18T19:19:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-18T19:35:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-18T20:47:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(3), alias_emisor: "AXIOM_47", rol_emisor: 'USUARIO', texto: "Gracias, buen trabajo.", fecha: ISODate("2026-10-18T20:59:00.000Z"), leido: true },
  { id_mision: NumberInt(13), id_emisor: NumberInt(16), alias_emisor: "RONIN_X", rol_emisor: 'CAZARRECOMPENSAS', texto: "Hubo un retraso, pero sigo en ello.", fecha: ISODate("2026-10-18T21:13:00.000Z"), leido: true },
  { id_mision: NumberInt(14), id_emisor: NumberInt(4), alias_emisor: "KIRA_09", rol_emisor: 'USUARIO', texto: "Te envío la ubicación exacta.", fecha: ISODate("2026-10-19T18:13:00.000Z"), leido: false },
  { id_mision: NumberInt(15), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Perfecto, quedo atento.", fecha: ISODate("2026-10-20T17:50:00.000Z"), leido: true },
  { id_mision: NumberInt(15), id_emisor: NumberInt(15), alias_emisor: "VANTA_K", rol_emisor: 'CAZARRECOMPENSAS', texto: "Necesito más detalles del objetivo.", fecha: ISODate("2026-10-20T18:54:00.000Z"), leido: true },
  { id_mision: NumberInt(15), id_emisor: NumberInt(5), alias_emisor: "NOVA_12", rol_emisor: 'USUARIO', texto: "Cuánto tiempo calculas?", fecha: ISODate("2026-10-20T19:23:00.000Z"), leido: false },
  { id_mision: NumberInt(16), id_emisor: NumberInt(6), alias_emisor: "GHOST_LINE", rol_emisor: 'USUARIO', texto: "Hay vigilancia en la entrada norte.", fecha: ISODate("2026-10-21T18:06:00.000Z"), leido: true },
  { id_mision: NumberInt(16), id_emisor: NumberInt(17), alias_emisor: "NIGHTMARE", rol_emisor: 'CAZARRECOMPENSAS', texto: "Confirmo, sin novedades.", fecha: ISODate("2026-10-21T18:26:00.000Z"), leido: false }
]);

db.bitacora_actividad.insertMany([
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T11:28:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-18T22:27:00.000Z"), id_mision: NumberInt(13) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-14T19:09:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-23T13:27:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-03T18:05:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(12) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-09T17:13:00.000Z"), id_cuenta_vista: NumberInt(24) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-24T23:46:00.000Z"), id_mision: NumberInt(11) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-14T15:22:00.000Z"), id_mision: NumberInt(11) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-12T18:45:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(3) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T15:05:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-30T20:50:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-29T12:53:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-06T15:33:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-06T21:04:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(1), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(1) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-10T08:40:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-01T15:45:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-26T22:25:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-13T23:31:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-27T08:51:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-05T11:26:00.000Z"), id_cuenta_vista: NumberInt(17) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-15T20:43:00.000Z"), exito: true },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T17:17:00.000Z"), id_cuenta_vista: NumberInt(15) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-24T11:19:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-11-03T08:37:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-20T23:38:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-21T23:56:00.000Z"), pantalla: 'mercado', filtros: {  }, resultados: NumberInt(1) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T20:03:00.000Z"), exito: true },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-29T16:50:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-11-04T19:28:00.000Z"), id_mision: NumberInt(23) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-15T21:10:00.000Z"), id_mision: NumberInt(5) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-07T12:40:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-07T09:09:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-27T16:39:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T10:47:00.000Z"), pantalla: 'mercado', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-11-02T14:02:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(5) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-30T10:35:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-09T19:04:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T11:41:00.000Z"), pantalla: 'mercado', filtros: {  }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T22:49:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-18T12:18:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(12) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T16:12:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-24T16:36:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-11T12:43:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(2), id_especialidad: NumberInt(4) }, resultados: NumberInt(1) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-19T09:10:00.000Z"), id_cuenta_vista: NumberInt(21) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T18:58:00.000Z"), id_mision: NumberInt(17) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-18T12:52:00.000Z"), id_mision: NumberInt(16) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-31T08:46:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(0) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-26T14:21:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T14:32:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-15T16:49:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2), id_especialidad: NumberInt(5) }, resultados: NumberInt(9) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-17T14:36:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-10T12:15:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(1) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-13T15:57:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(3), texto: "drones" }, resultados: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-12T08:18:00.000Z"), id_mision: NumberInt(12) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-28T13:11:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-24T20:39:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(0) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-11-07T20:07:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2) }, resultados: NumberInt(5) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-07T12:25:00.000Z"), id_cuenta_vista: NumberInt(24) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-04T19:26:00.000Z"), id_mision: NumberInt(23) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T17:31:00.000Z"), id_mision: NumberInt(15) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T21:07:00.000Z"), pantalla: 'mercado', filtros: { id_especialidad: NumberInt(5) }, resultados: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-25T09:18:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-29T18:48:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-20T11:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(1) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-20T17:42:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(10) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-31T13:14:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T10:06:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4), texto: "escolta" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-06T18:11:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T20:09:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-24T08:29:00.000Z"), id_mision: NumberInt(10) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-11-05T12:59:00.000Z"), id_mision: NumberInt(16) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-17T17:54:00.000Z"), id_cuenta_vista: NumberInt(15) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-25T19:57:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(0) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-11T17:46:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T12:21:00.000Z"), id_mision: NumberInt(15) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T13:14:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-17T16:11:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-22T19:51:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-07T15:19:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T16:08:00.000Z"), id_mision: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-09T22:58:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(5), texto: "drones" }, resultados: NumberInt(6) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-10T13:18:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-16T16:46:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(7) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-29T08:59:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-09T19:20:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-23T13:38:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-11-01T15:42:00.000Z"), pantalla: 'buscar_cazadores', filtros: {  }, resultados: NumberInt(3) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-05T15:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(1) }, resultados: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-14T08:38:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(0) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-10-12T13:36:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-20T12:03:00.000Z"), exito: false },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-11-07T16:48:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(7) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-03T09:20:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-07T12:31:00.000Z"), id_mision: NumberInt(20) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-14T22:33:00.000Z"), id_mision: NumberInt(2) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-20T21:56:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(4) }, resultados: NumberInt(0) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-19T17:16:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-03T10:59:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-18T09:10:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(9) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-03T20:59:00.000Z"), id_mision: NumberInt(13) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(15), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-08T14:26:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-15T23:13:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(4) }, resultados: NumberInt(10) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-05T14:34:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_PERFIL', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-21T20:36:00.000Z"), id_cuenta_vista: NumberInt(18) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-11T19:03:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-13T15:46:00.000Z"), id_mision: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-25T20:28:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-21T09:19:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(5) }, resultados: NumberInt(0) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-10-24T21:27:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(5), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T12:56:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(1), rol: 'ADMINISTRADOR', fecha: ISODate("2026-11-02T20:08:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(10), rol: 'USUARIO', fecha: ISODate("2026-10-11T17:23:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-06T23:36:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-24T10:58:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-12T19:15:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(5), rol: 'USUARIO', fecha: ISODate("2026-11-01T11:25:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(3), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(6) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(9), rol: 'USUARIO', fecha: ISODate("2026-11-04T13:22:00.000Z"), id_mision: NumberInt(8) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T18:58:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(5), texto: "muelle" }, resultados: NumberInt(6) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-28T10:58:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), disponibilidad: "DISPONIBLE" }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-21T10:01:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-24T16:52:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T20:39:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-18T10:40:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(22), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T10:17:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(17), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-29T20:02:00.000Z"), id_mision: NumberInt(22) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-22T17:31:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(7), rol: 'USUARIO', fecha: ISODate("2026-10-17T16:14:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(19), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-05T20:00:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T18:16:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(13), rol: 'USUARIO', fecha: ISODate("2026-10-18T20:43:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-10-15T18:39:00.000Z"), id_mision: NumberInt(19) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-28T21:18:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(4), id_especialidad: NumberInt(2) }, resultados: NumberInt(11) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(8), rol: 'USUARIO', fecha: ISODate("2026-11-06T12:56:00.000Z"), exito: false },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(6), rol: 'USUARIO', fecha: ISODate("2026-10-24T11:54:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_especialidad: NumberInt(2) }, resultados: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T09:22:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-30T16:45:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(3), id_especialidad: NumberInt(2) }, resultados: NumberInt(2) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-31T12:39:00.000Z"), id_mision: NumberInt(9) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-15T12:12:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(2) }, resultados: NumberInt(7) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(21), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-13T16:44:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T20:59:00.000Z"), id_mision: NumberInt(5) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-15T11:55:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(2), rol: 'ADMINISTRADOR', fecha: ISODate("2026-10-12T20:21:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-11-04T13:23:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-23T15:25:00.000Z"), id_mision: NumberInt(14) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(3), rol: 'USUARIO', fecha: ISODate("2026-10-14T20:43:00.000Z"), id_mision: NumberInt(18) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-14T22:11:00.000Z"), id_mision: NumberInt(18) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-11-05T21:07:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(11), rol: 'USUARIO', fecha: ISODate("2026-10-14T16:40:00.000Z"), pantalla: 'buscar_cazadores', filtros: { id_zona: NumberInt(1), id_especialidad: NumberInt(3) }, resultados: NumberInt(8) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-14T10:00:00.000Z"), id_mision: NumberInt(10) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(24), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-10T08:11:00.000Z"), exito: true },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-17T21:30:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T09:13:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(5), id_especialidad: NumberInt(2) }, resultados: NumberInt(3) },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-11-02T09:11:00.000Z"), id_mision: NumberInt(6) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(20), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-12T10:17:00.000Z"), exito: true },
  { tipo: 'VISTA_MISION', id_cuenta: NumberInt(12), rol: 'USUARIO', fecha: ISODate("2026-10-09T22:00:00.000Z"), id_mision: NumberInt(3) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(14), rol: 'USUARIO', fecha: ISODate("2026-10-05T16:51:00.000Z"), exito: true },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(18), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-30T17:51:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(1) }, resultados: NumberInt(11) },
  { tipo: 'BUSQUEDA', id_cuenta: NumberInt(16), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-21T08:00:00.000Z"), pantalla: 'mercado', filtros: { id_zona: NumberInt(4) }, resultados: NumberInt(4) },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(4), rol: 'USUARIO', fecha: ISODate("2026-10-28T22:22:00.000Z"), exito: false },
  { tipo: 'INICIO_SESION', id_cuenta: NumberInt(23), rol: 'CAZARRECOMPENSAS', fecha: ISODate("2026-10-25T11:16:00.000Z"), exito: true }
]);

print('publicaciones: ' + db.publicaciones.countDocuments());
print('mensajes_chat: ' + db.mensajes_chat.countDocuments());
print('bitacora_actividad: ' + db.bitacora_actividad.countDocuments());
