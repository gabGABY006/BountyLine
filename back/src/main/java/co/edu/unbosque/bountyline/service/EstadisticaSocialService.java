package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.bson.Document;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.repository.EstadisticaSocialRepository;

/** Reportes de la parte no relacional para el administrador. */
@Service
public class EstadisticaSocialService {

    private final EstadisticaSocialRepository repo;

    public EstadisticaSocialService(EstadisticaSocialRepository repo) {
        this.repo = repo;
    }

    public List<Document> etiquetasPorZona(int top) {
        return repo.etiquetasPorZona(Math.max(1, Math.min(top, 20)));
    }

    public List<Document> publicacionesPorSemana() {
        return repo.publicacionesPorSemana();
    }

    public Document mensajesPorMision() {
        List<Document> r = repo.mensajesPorMision();
        return r.isEmpty() ? new Document("misiones_con_chat", 0).append("promedio", 0).append("maximo", 0) : r.get(0);
    }

    public List<Document> filtrosMasUsados() {
        return repo.filtrosMasUsados();
    }
}
