package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.CalificacionDto;

@Repository
public class CalificacionRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CalificacionRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<CalificacionDto> listar(Long idMision, Long idCazarrecompensas) {
        StringBuilder sql = new StringBuilder(
                "SELECT ca.id_calificacion, ca.id_mision, m.id_cazarrecompensas, c.alias, ca.puntaje, ca.comentario, "
                        + "ca.fecha FROM calificacion ca JOIN mision m ON m.id_mision = ca.id_mision "
                        + "JOIN cuenta c ON c.id_cuenta = m.id_cazarrecompensas WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (idMision != null) {
            sql.append(" AND ca.id_mision = ?");
            args.add(idMision);
        }
        if (idCazarrecompensas != null) {
            sql.append(" AND m.id_cazarrecompensas = ?");
            args.add(idCazarrecompensas);
        }
        sql.append(" ORDER BY ca.fecha DESC");
        return jdbc.query(sql.toString(),
                (rs, i) -> new CalificacionDto(rs.getLong("id_calificacion"), rs.getLong("id_mision"),
                        rs.getLong("id_cazarrecompensas"), rs.getString("alias"), rs.getInt("puntaje"),
                        rs.getString("comentario"), Filas.fecha(rs, "fecha")),
                args.toArray());
    }

    public void calificar(Long idMision, Long idUsuario, Integer puntaje, String comentario) {
        procedimientos.llamar("sp_calificar_mision", idMision, idUsuario, puntaje, comentario);
    }
}
