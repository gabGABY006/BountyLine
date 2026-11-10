package co.edu.unbosque.bountyline.repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Comentario;
import co.edu.unbosque.bountyline.model.Publicacion;

/** Acceso a la colección publicaciones de MongoDB. */
@Repository
public class PublicacionRepository {

    private final MongoTemplate mongo;

    public PublicacionRepository(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    /** Feed con filtros opcionales; los más recientes primero. */
    public List<Publicacion> listar(boolean soloVisibles, String etiqueta, Integer idZona, Integer idCuenta,
                                    Integer idMision, String texto, int pagina, int tamano) {
        List<Criteria> filtros = new ArrayList<>();
        if (soloVisibles) {
            filtros.add(Criteria.where("estado_moderacion").is("VISIBLE"));
        }
        if (etiqueta != null && !etiqueta.isBlank()) {
            filtros.add(Criteria.where("etiquetas").is(etiqueta.trim().toLowerCase()));
        }
        if (idZona != null) {
            filtros.add(Criteria.where("id_zona").is(idZona));
        }
        if (idCuenta != null) {
            filtros.add(Criteria.where("id_cuenta").is(idCuenta));
        }
        if (idMision != null) {
            filtros.add(Criteria.where("id_mision").is(idMision));
        }
        if (texto != null && !texto.isBlank()) {
            filtros.add(Criteria.where("texto").regex(Pattern.quote(texto.trim()), "i"));
        }
        Query q = filtros.isEmpty() ? new Query() : new Query(new Criteria().andOperator(filtros));
        q.with(Sort.by(Sort.Direction.DESC, "fecha_publicacion")).skip((long) pagina * tamano).limit(tamano);
        return mongo.find(q, Publicacion.class);
    }

    public Optional<Publicacion> buscar(String id) {
        if (!ObjectId.isValid(id)) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongo.findById(new ObjectId(id), Publicacion.class));
    }

    public Publicacion insertar(Publicacion p) {
        return mongo.insert(p);
    }

    public void editar(String id, String texto, List<String> etiquetas) {
        Update u = new Update().set("texto", texto).set("etiquetas", etiquetas).set("fecha_edicion", Instant.now());
        mongo.updateFirst(porId(id), u, Publicacion.class);
    }

    public void eliminar(String id) {
        mongo.remove(porId(id), Publicacion.class);
    }

    public void agregarComentario(String id, Comentario c) {
        mongo.updateFirst(porId(id), new Update().push("comentarios", c), Publicacion.class);
    }

    /** Quita la reacción que tenga la cuenta (si la tiene) y descuenta su tipo. */
    public void quitarReaccion(String id, Integer idCuenta, String tipo) {
        Query q = new Query(Criteria.where("_id").is(new ObjectId(id))
                .and("reaccionaron").elemMatch(Criteria.where("id_cuenta").is(idCuenta).and("tipo").is(tipo)));
        Update u = new Update()
                .pull("reaccionaron", new org.bson.Document("id_cuenta", idCuenta))
                .inc("reacciones." + tipo, -1);
        mongo.updateFirst(q, u, Publicacion.class);
    }

    /** Agrega la reacción solo si la cuenta no ha reaccionado (una por cuenta). */
    public void agregarReaccion(String id, Integer idCuenta, String tipo) {
        Query q = new Query(Criteria.where("_id").is(new ObjectId(id)).and("reaccionaron.id_cuenta").ne(idCuenta));
        Update u = new Update()
                .push("reaccionaron", new Publicacion.Reaccion(idCuenta, tipo))
                .inc("reacciones." + tipo, 1);
        mongo.updateFirst(q, u, Publicacion.class);
    }

    public void moderar(String id, String estado) {
        mongo.updateFirst(porId(id), new Update().set("estado_moderacion", estado), Publicacion.class);
    }

    /** Oculta o muestra un comentario por su id; devuelve true si lo encontró. */
    public boolean moderarComentario(String idComentario, String estado) {
        if (!ObjectId.isValid(idComentario)) {
            return false;
        }
        Query q = new Query(Criteria.where("comentarios._id").is(new ObjectId(idComentario)));
        return mongo.updateFirst(q, new Update().set("comentarios.$.estado_moderacion", estado), Publicacion.class)
                .getMatchedCount() > 0;
    }

    /** True si existe un comentario con ese id en alguna publicación. */
    public boolean existeComentario(String idComentario) {
        return ObjectId.isValid(idComentario)
                && mongo.count(new Query(Criteria.where("comentarios._id").is(new ObjectId(idComentario))), Publicacion.class) > 0;
    }

    private static Query porId(String id) {
        return new Query(Criteria.where("_id").is(new ObjectId(id)));
    }
}
