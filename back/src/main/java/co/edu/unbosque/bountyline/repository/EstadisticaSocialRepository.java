package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

/**
 * Agregaciones de MongoDB para los reportes de la propuesta (sección 6.2):
 * etiquetas por zona, publicaciones por semana, mensajes por misión y filtros
 * de búsqueda más usados.
 */
@Repository
public class EstadisticaSocialRepository {

    private final MongoTemplate mongo;

    public EstadisticaSocialRepository(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    public List<Document> etiquetasPorZona(int top) {
        return agregar("publicaciones", List.of(
                new Document("$match", new Document("estado_moderacion", "VISIBLE").append("id_zona", new Document("$ne", null))),
                new Document("$unwind", "$etiquetas"),
                new Document("$group", new Document("_id", new Document("zona", "$zona").append("etiqueta", "$etiquetas"))
                        .append("usos", new Document("$sum", 1))),
                new Document("$sort", new Document("_id.zona", 1).append("usos", -1)),
                new Document("$group", new Document("_id", "$_id.zona")
                        .append("etiquetas", new Document("$push", new Document("etiqueta", "$_id.etiqueta").append("usos", "$usos")))),
                new Document("$project", new Document("_id", 0).append("zona", "$_id")
                        .append("etiquetas", new Document("$slice", List.of("$etiquetas", top)))),
                new Document("$sort", new Document("zona", 1))));
    }

    public List<Document> publicacionesPorSemana() {
        return agregar("publicaciones", List.of(
                new Document("$group", new Document("_id", new Document("anio", new Document("$isoWeekYear", "$fecha_publicacion"))
                        .append("semana", new Document("$isoWeek", "$fecha_publicacion")))
                        .append("publicaciones", new Document("$sum", 1))
                        .append("comentarios", new Document("$sum", new Document("$size", "$comentarios")))),
                new Document("$sort", new Document("_id.anio", 1).append("_id.semana", 1)),
                new Document("$project", new Document("_id", 0).append("anio", "$_id.anio").append("semana", "$_id.semana")
                        .append("publicaciones", 1).append("comentarios", 1))));
    }

    public List<Document> mensajesPorMision() {
        return agregar("mensajes_chat", List.of(
                new Document("$group", new Document("_id", "$id_mision").append("mensajes", new Document("$sum", 1))),
                new Document("$group", new Document("_id", null).append("misiones_con_chat", new Document("$sum", 1))
                        .append("promedio", new Document("$avg", "$mensajes")).append("maximo", new Document("$max", "$mensajes"))),
                new Document("$project", new Document("_id", 0).append("misiones_con_chat", 1)
                        .append("promedio", new Document("$round", List.of("$promedio", 2))).append("maximo", 1))));
    }

    public List<Document> filtrosMasUsados() {
        return agregar("bitacora_actividad", List.of(
                new Document("$match", new Document("tipo", "BUSQUEDA")),
                new Document("$project", new Document("pantalla", 1).append("filtro", new Document("$objectToArray", "$filtros"))),
                new Document("$unwind", "$filtro"),
                new Document("$group", new Document("_id", new Document("pantalla", "$pantalla").append("filtro", "$filtro.k"))
                        .append("veces", new Document("$sum", 1))),
                new Document("$sort", new Document("veces", -1)),
                new Document("$project", new Document("_id", 0).append("pantalla", "$_id.pantalla")
                        .append("filtro", "$_id.filtro").append("veces", 1))));
    }

    private List<Document> agregar(String coleccion, List<Document> etapas) {
        return mongo.getCollection(coleccion).aggregate(etapas).into(new ArrayList<>());
    }
}
