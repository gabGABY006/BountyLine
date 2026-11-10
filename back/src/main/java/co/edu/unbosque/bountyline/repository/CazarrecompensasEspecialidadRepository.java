package co.edu.unbosque.bountyline.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.CazarrecompensasEspecialidadDto;

@Repository
public class CazarrecompensasEspecialidadRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CazarrecompensasEspecialidadRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<CazarrecompensasEspecialidadDto> listarPorCazarrecompensas(Long idCazarrecompensas) {
        return jdbc.query(
                "SELECT ce.id_cazarrecompensas, ce.id_especialidad, e.nombre, ce.nivel "
                        + "FROM cazarrecompensas_especialidad ce "
                        + "JOIN especialidad e ON e.id_especialidad = ce.id_especialidad "
                        + "WHERE ce.id_cazarrecompensas = ? ORDER BY ce.nivel DESC, e.nombre",
                (rs, i) -> new CazarrecompensasEspecialidadDto(rs.getLong("id_cazarrecompensas"),
                        rs.getLong("id_especialidad"), rs.getString("nombre"), rs.getInt("nivel")),
                idCazarrecompensas);
    }

    public void guardar(Long idCazarrecompensas, Long idEspecialidad, Integer nivel) {
        procedimientos.llamar("sp_guardar_especialidad_caz", idCazarrecompensas, idEspecialidad, nivel);
    }

    public void quitar(Long idCazarrecompensas, Long idEspecialidad) {
        procedimientos.llamar("sp_quitar_especialidad_caz", idCazarrecompensas, idEspecialidad);
    }
}
