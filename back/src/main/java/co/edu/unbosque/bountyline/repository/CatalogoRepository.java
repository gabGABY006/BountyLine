package co.edu.unbosque.bountyline.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.CatalogoDtos;
import co.edu.unbosque.bountyline.model.Especialidad;
import co.edu.unbosque.bountyline.model.Zona;

@Repository
public class CatalogoRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CatalogoRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<Zona> zonas() {
        return jdbc.query("SELECT id_zona, nombre, descripcion, nivel_peligro, id_administrador FROM zona ORDER BY nombre",
                (rs, i) -> new Zona(rs.getLong("id_zona"), rs.getString("nombre"), rs.getString("descripcion"),
                        rs.getInt("nivel_peligro"), rs.getLong("id_administrador")));
    }

    public List<Especialidad> especialidades() {
        return jdbc.query("SELECT id_especialidad, nombre, descripcion, id_administrador FROM especialidad ORDER BY nombre",
                (rs, i) -> new Especialidad(rs.getLong("id_especialidad"), rs.getString("nombre"),
                        rs.getString("descripcion"), rs.getLong("id_administrador")));
    }

    public Long crearZona(CatalogoDtos.NuevaZona z) {
        return procedimientos.llamarConSalida("sp_crear_zona",
                z.idAdministrador(), z.nombre(), z.descripcion(), z.nivelPeligro());
    }

    public Long crearEspecialidad(CatalogoDtos.NuevaEspecialidad e) {
        return procedimientos.llamarConSalida("sp_crear_especialidad",
                e.idAdministrador(), e.nombre(), e.descripcion());
    }
}
