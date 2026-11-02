package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.CazarrecompensasDto;
import co.edu.unbosque.bountyline.model.Cazarrecompensas;

@Repository
public class CazarrecompensasRepository {

    private static final String SELECT_PERFIL =
            "SELECT id_cazarrecompensas, alias, estado_cuenta, biografia, disponibilidad, reputacion, id_zona, "
                    + "zona, misiones_completadas, especialidades FROM v_cazarrecompensas_perfil";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CazarrecompensasRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static CazarrecompensasDto mapearPerfil(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new CazarrecompensasDto(rs.getLong("id_cazarrecompensas"), rs.getString("alias"),
                rs.getString("estado_cuenta"), rs.getString("biografia"), rs.getString("disponibilidad"),
                rs.getBigDecimal("reputacion"), rs.getLong("id_zona"), rs.getString("zona"),
                rs.getInt("misiones_completadas"), rs.getString("especialidades"));
    }

    /** Búsqueda manual con filtros (RF-06). */
    public List<CazarrecompensasDto> listarPerfiles(Long idZona, String disponibilidad) {
        StringBuilder sql = new StringBuilder(SELECT_PERFIL).append(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (idZona != null) {
            sql.append(" AND id_zona = ?");
            args.add(idZona);
        }
        if (disponibilidad != null && !disponibilidad.isBlank()) {
            sql.append(" AND disponibilidad = ?");
            args.add(disponibilidad);
        }
        sql.append(" ORDER BY reputacion IS NULL, reputacion DESC, alias");
        return jdbc.query(sql.toString(), CazarrecompensasRepository::mapearPerfil, args.toArray());
    }

    public Optional<CazarrecompensasDto> buscarPerfil(Long idCazarrecompensas) {
        return jdbc.query(SELECT_PERFIL + " WHERE id_cazarrecompensas = ?",
                CazarrecompensasRepository::mapearPerfil, idCazarrecompensas).stream().findFirst();
    }

    public Optional<Cazarrecompensas> buscarPorId(Long idCazarrecompensas) {
        return jdbc.query(
                "SELECT id_cazarrecompensas, id_zona, biografia, disponibilidad, reputacion FROM cazarrecompensas "
                        + "WHERE id_cazarrecompensas = ?",
                (rs, i) -> new Cazarrecompensas(rs.getLong("id_cazarrecompensas"), rs.getLong("id_zona"),
                        rs.getString("biografia"), rs.getString("disponibilidad"), rs.getBigDecimal("reputacion")),
                idCazarrecompensas).stream().findFirst();
    }

    public void actualizar(Long idCazarrecompensas, Long idZona, String biografia, String disponibilidad) {
        procedimientos.llamar("sp_actualizar_cazarrecompensas", idCazarrecompensas, idZona, biografia, disponibilidad);
    }
}
