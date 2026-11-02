package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Zona;

@Repository
public class ZonaRepository {

    private static final String SELECT = "SELECT id_zona, nombre, descripcion, nivel_peligro, id_administrador FROM zona";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public ZonaRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static Zona mapear(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new Zona(rs.getLong("id_zona"), rs.getString("nombre"), rs.getString("descripcion"),
                rs.getInt("nivel_peligro"), rs.getLong("id_administrador"));
    }

    public List<Zona> listar() {
        return jdbc.query(SELECT + " ORDER BY nombre", ZonaRepository::mapear);
    }

    public Optional<Zona> buscarPorId(Long idZona) {
        return jdbc.query(SELECT + " WHERE id_zona = ?", ZonaRepository::mapear, idZona).stream().findFirst();
    }

    public Long crear(Long idAdministrador, String nombre, String descripcion, Integer nivelPeligro) {
        return procedimientos.llamarConSalida("sp_crear_zona", idAdministrador, nombre, descripcion, nivelPeligro);
    }

    public void actualizar(Long idAdministrador, Long idZona, String nombre, String descripcion, Integer nivelPeligro) {
        procedimientos.llamar("sp_actualizar_zona", idAdministrador, idZona, nombre, descripcion, nivelPeligro);
    }
}
