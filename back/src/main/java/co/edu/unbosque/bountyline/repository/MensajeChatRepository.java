package co.edu.unbosque.bountyline.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.MensajeChat;

/** Acceso a la colección mensajes_chat de MongoDB. */
@Repository
public class MensajeChatRepository {

    private final MongoTemplate mongo;

    public MensajeChatRepository(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    /** Mensajes de una misión en orden de envío. */
    public List<MensajeChat> listar(Integer idMision) {
        Query q = new Query(Criteria.where("id_mision").is(idMision)).with(Sort.by(Sort.Direction.ASC, "fecha"));
        return mongo.find(q, MensajeChat.class);
    }

    public MensajeChat insertar(MensajeChat m) {
        return mongo.insert(m);
    }

    /** Marca como leídos los mensajes que envió la otra persona; devuelve cuántos cambiaron. */
    public long marcarLeidos(Integer idMision, Integer idLector) {
        Query q = new Query(Criteria.where("id_mision").is(idMision).and("id_emisor").ne(idLector).and("leido").is(false));
        return mongo.updateMulti(q, new Update().set("leido", true), MensajeChat.class).getModifiedCount();
    }

    public long contarSinLeer(Integer idMision, Integer idLector) {
        Query q = new Query(Criteria.where("id_mision").is(idMision).and("id_emisor").ne(idLector).and("leido").is(false));
        return mongo.count(q, MensajeChat.class);
    }
}
