// =====================================================================
// BountyLine - MongoDB: consultas de ejemplo
// CRUD, consultas con filtros combinados y proyección, y agregaciones con
// $match, $unwind, $group, $sort y $lookup (propuesta, sección 6.2).
// Ejecutar con: mongosh -u bountyline_admin -p --authenticationDatabase admin 04_consultas.js
// =====================================================================
use('bountyline');
const titulo = t => print('\n== ' + t);

// ------------------------------- CRUD --------------------------------
titulo('Crear una publicación');
const nueva = db.publicaciones.insertOne({
  id_cuenta: NumberInt(3), alias: 'AXIOM_47', rol: 'USUARIO',
  texto: 'Publicación de prueba creada desde el script de consultas.',
  etiquetas: ['prueba'], id_zona: NumberInt(1), zona: 'Distrito Centro', id_mision: null,
  reacciones: { me_gusta: NumberInt(0), fuego: NumberInt(0), alerta: NumberInt(0) },
  reaccionaron: [], comentarios: [], estado_moderacion: 'VISIBLE',
  fecha_publicacion: new Date(), fecha_edicion: null
});
printjson(nueva);

titulo('Agregar un comentario y una reacción (sin repetir la reacción de la misma cuenta)');
db.publicaciones.updateOne(
  { _id: nueva.insertedId },
  { $push: { comentarios: { _id: new ObjectId(), id_cuenta: NumberInt(15), alias: 'VANTA_K',
                            texto: 'Comentario de prueba.', fecha: new Date(), estado_moderacion: 'VISIBLE' } } }
);
db.publicaciones.updateOne(
  { _id: nueva.insertedId, 'reaccionaron.id_cuenta': { $ne: NumberInt(15) } },
  { $push: { reaccionaron: { id_cuenta: NumberInt(15), tipo: 'fuego' } }, $inc: { 'reacciones.fuego': NumberInt(1) } }
);
printjson(db.publicaciones.findOne({ _id: nueva.insertedId }, { texto: 1, reacciones: 1, comentarios: 1 }));

titulo('Editar el texto');
db.publicaciones.updateOne({ _id: nueva.insertedId },
  { $set: { texto: 'Publicación de prueba (editada).', fecha_edicion: new Date() } });

titulo('Moderación: ocultar el comentario reportado en MySQL (reporte 4)');
db.publicaciones.updateOne(
  { 'comentarios._id': ObjectId('665f1c2a9b3e4d0012ab34d1') },
  { $set: { 'comentarios.$.estado_moderacion': 'OCULTO' } }
);

titulo('Borrar la publicación de prueba');
printjson(db.publicaciones.deleteOne({ _id: nueva.insertedId }));

// ------------------------- Consultas con filtros ---------------------
titulo('Feed: publicaciones visibles de una zona con alguna de dos etiquetas, en un rango de fechas');
db.publicaciones.find(
  { estado_moderacion: 'VISIBLE', id_zona: NumberInt(2), etiquetas: { $in: ['alerta', 'contrabando'] },
    fecha_publicacion: { $gte: ISODate('2026-10-01'), $lt: ISODate('2026-12-01') } },
  { _id: 0, alias: 1, texto: 1, etiquetas: 1, fecha_publicacion: 1, total_comentarios: { $size: '$comentarios' } }
).sort({ fecha_publicacion: -1 }).forEach(printjson);

titulo('Búsqueda de texto: "puerto alerta"');
db.publicaciones.find(
  { $text: { $search: 'puerto alerta' }, estado_moderacion: 'VISIBLE' },
  { _id: 0, alias: 1, texto: 1, puntaje: { $meta: 'textScore' } }
).sort({ puntaje: { $meta: 'textScore' } }).limit(5).forEach(printjson);

titulo('Chat de la misión 11, en orden');
db.mensajes_chat.find({ id_mision: NumberInt(11) }, { _id: 0, alias_emisor: 1, texto: 1, fecha: 1 })
  .sort({ fecha: 1 }).forEach(printjson);

titulo('Mensajes sin leer por misión');
db.mensajes_chat.aggregate([
  { $match: { leido: false } },
  { $group: { _id: '$id_mision', sin_leer: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).forEach(printjson);

// ---------------------------- Agregaciones ---------------------------
titulo('Etiquetas más usadas por zona');
db.publicaciones.aggregate([
  { $match: { estado_moderacion: 'VISIBLE', id_zona: { $ne: null } } },
  { $unwind: '$etiquetas' },
  { $group: { _id: { zona: '$zona', etiqueta: '$etiquetas' }, usos: { $sum: 1 } } },
  { $sort: { '_id.zona': 1, usos: -1 } },
  { $group: { _id: '$_id.zona', etiquetas: { $push: { etiqueta: '$_id.etiqueta', usos: '$usos' } } } },
  { $project: { _id: 0, zona: '$_id', top3: { $slice: ['$etiquetas', 3] } } },
  { $sort: { zona: 1 } }
]).forEach(printjson);

titulo('Publicaciones por semana');
db.publicaciones.aggregate([
  { $group: { _id: { anio: { $isoWeekYear: '$fecha_publicacion' }, semana: { $isoWeek: '$fecha_publicacion' } },
              publicaciones: { $sum: 1 }, comentarios: { $sum: { $size: '$comentarios' } } } },
  { $sort: { '_id.anio': 1, '_id.semana': 1 } }
]).forEach(printjson);

titulo('Cantidad promedio de mensajes por misión');
db.mensajes_chat.aggregate([
  { $group: { _id: '$id_mision', mensajes: { $sum: 1 } } },
  { $group: { _id: null, misiones_con_chat: { $sum: 1 }, promedio: { $avg: '$mensajes' }, maximo: { $max: '$mensajes' } } },
  { $project: { _id: 0, misiones_con_chat: 1, promedio: { $round: ['$promedio', 2] }, maximo: 1 } }
]).forEach(printjson);

titulo('Filtros de búsqueda más usados');
db.bitacora_actividad.aggregate([
  { $match: { tipo: 'BUSQUEDA' } },
  { $project: { pantalla: 1, filtro: { $objectToArray: '$filtros' } } },
  { $unwind: '$filtro' },
  { $group: { _id: { pantalla: '$pantalla', filtro: '$filtro.k' }, veces: { $sum: 1 } } },
  { $sort: { veces: -1 } }
]).forEach(printjson);

titulo('$lookup: misiones mencionadas en publicaciones junto con la cantidad de mensajes de su chat');
db.publicaciones.aggregate([
  { $match: { id_mision: { $ne: null } } },
  { $lookup: { from: 'mensajes_chat', localField: 'id_mision', foreignField: 'id_mision', as: 'chat' } },
  { $project: { _id: 0, id_mision: 1, alias: 1, texto: 1, mensajes_chat: { $size: '$chat' } } },
  { $sort: { mensajes_chat: -1 } }
]).forEach(printjson);

titulo('Actividad por tipo de evento y día de la semana');
db.bitacora_actividad.aggregate([
  { $group: { _id: { tipo: '$tipo', dia: { $dayOfWeek: '$fecha' } }, eventos: { $sum: 1 } } },
  { $sort: { '_id.tipo': 1, '_id.dia': 1 } }
]).forEach(printjson);
