package com.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.bountyline.dto.CazarrecompensasDto;

@Repository
public class CazarrecompensasRepository {

    private final JdbcTemplate jdbc;

    public CazarrecompensasRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CazarrecompensasDto> listar(Long idZona, String disponibilidad) {
        StringBuilder sql = new StringBuilder(
                "SELECT id_cazarrecompensas, alias, estado_cuenta, biografia, disponibilidad, reputacion, id_zona, "
                        + "zona, misiones_completadas, especialidades FROM v_cazarrecompensas_perfil WHERE 1 = 1");
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
        return jdbc.query(sql.toString(),
                (rs, i) -> new CazarrecompensasDto(rs.getLong("id_cazarrecompensas"), rs.getString("alias"),
                        rs.getString("estado_cuenta"), rs.getString("biografia"), rs.getString("disponibilidad"),
                        rs.getBigDecimal("reputacion"), rs.getLong("id_zona"), rs.getString("zona"),
                        rs.getInt("misiones_completadas"), rs.getString("especialidades")),
                args.toArray());
    }
}
