package co.edu.unbosque.bountyline.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.EventoActividad;

/** Acceso a la colección bitacora_actividad de MongoDB. */
@Repository
public class EventoActividadRepository {

    private final MongoTemplate mongo;

    public EventoActividadRepository(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    public void insertar(EventoActividad e) {
        mongo.insert(e);
    }

    public List<EventoActividad> listar(String tipo, Integer idCuenta, Instant desde, Instant hasta, int limite) {
        Query q = new Query();
        if (tipo != null && !tipo.isBlank()) {
            q.addCriteria(Criteria.where("tipo").is(tipo));
        }
        if (idCuenta != null) {
            q.addCriteria(Criteria.where("id_cuenta").is(idCuenta));
        }
        if (desde != null && hasta != null) {
            q.addCriteria(Criteria.where("fecha").gte(desde).lt(hasta));
        } else if (desde != null) {
            q.addCriteria(Criteria.where("fecha").gte(desde));
        } else if (hasta != null) {
            q.addCriteria(Criteria.where("fecha").lt(hasta));
        }
        q.with(Sort.by(Sort.Direction.DESC, "fecha")).limit(limite);
        return mongo.find(q, EventoActividad.class);
    }
}
