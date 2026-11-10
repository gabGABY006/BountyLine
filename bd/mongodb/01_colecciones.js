// =====================================================================
// BountyLine - MongoDB: creación de la base, colecciones, validadores e índices
// Contenido social (S6, S80-S85): publicaciones, mensajes de chat y
// bitácora de actividad. Las cuentas y misiones viven en MySQL y aquí se
// referencian por su identificador (id_cuenta, id_mision).
// Ejecutar con: mongosh 01_colecciones.js, o abrirlo como Playground en VS Code
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
