package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Especialidad;

@Repository
public class EspecialidadRepository {

    private static final String SELECT = "SELECT id_especialidad, nombre, descripcion, id_administrador FROM especialidad";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public EspecialidadRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static Especialidad mapear(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new Especialidad(rs.getLong("id_especialidad"), rs.getString("nombre"), rs.getString("descripcion"),
                rs.getLong("id_administrador"));
    }

    public List<Especialidad> listar() {
        return jdbc.query(SELECT + " ORDER BY nombre", EspecialidadRepository::mapear);
    }

    public Optional<Especialidad> buscarPorId(Long idEspecialidad) {
        return jdbc.query(SELECT + " WHERE id_especialidad = ?", EspecialidadRepository::mapear, idEspecialidad)
                .stream().findFirst();
    }

    public Long crear(Long idAdministrador, String nombre, String descripcion) {
        return procedimientos.llamarConSalida("sp_crear_especialidad", idAdministrador, nombre, descripcion);
    }

    public void actualizar(Long idAdministrador, Long idEspecialidad, String nombre, String descripcion) {
        procedimientos.llamar("sp_actualizar_especialidad", idAdministrador, idEspecialidad, nombre, descripcion);
    }
}
