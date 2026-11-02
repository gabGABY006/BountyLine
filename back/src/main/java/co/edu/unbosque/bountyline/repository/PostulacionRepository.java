package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.PostulacionDto;

@Repository
public class PostulacionRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public PostulacionRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<PostulacionDto> listar(Long idMision, Long idCazarrecompensas) {
        StringBuilder sql = new StringBuilder(
                "SELECT p.id_mision, p.id_cazarrecompensas, c.alias, p.fecha_postulacion, p.mensaje, "
                        + "p.estado_postulacion, fn_puntaje_match(p.id_cazarrecompensas, p.id_mision) AS puntaje "
                        + "FROM postulacion p JOIN cuenta c ON c.id_cuenta = p.id_cazarrecompensas WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (idMision != null) {
            sql.append(" AND p.id_mision = ?");
            args.add(idMision);
        }
        if (idCazarrecompensas != null) {
            sql.append(" AND p.id_cazarrecompensas = ?");
            args.add(idCazarrecompensas);
        }
        sql.append(" ORDER BY puntaje DESC, p.fecha_postulacion");
        return jdbc.query(sql.toString(),
                (rs, i) -> new PostulacionDto(rs.getLong("id_mision"), rs.getLong("id_cazarrecompensas"),
                        rs.getString("alias"), Filas.fecha(rs, "fecha_postulacion"), rs.getString("mensaje"),
                        rs.getString("estado_postulacion"), rs.getInt("puntaje")),
                args.toArray());
    }

    public void postular(Long idMision, Long idCazarrecompensas, String mensaje) {
        procedimientos.llamar("sp_postular", idMision, idCazarrecompensas, mensaje);
    }
}
