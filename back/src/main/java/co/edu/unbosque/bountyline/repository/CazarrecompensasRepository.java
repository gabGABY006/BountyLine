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

    public List<CazarrecompensasDto> listarPerfiles(String alias, Long idZona, Long idEspecialidad,
                                                    String disponibilidad) {
        StringBuilder sql = new StringBuilder(SELECT_PERFIL).append(" WHERE estado_cuenta = 'ACTIVA'");
        List<Object> args = new ArrayList<>();
        if (alias != null && !alias.isBlank()) {
            sql.append(" AND alias LIKE ?");
            args.add(Filas.contiene(alias));
        }
        if (idEspecialidad != null) {
            sql.append(" AND id_cazarrecompensas IN (SELECT id_cazarrecompensas FROM cazarrecompensas_especialidad "
                    + "WHERE id_especialidad = ?)");
            args.add(idEspecialidad);
        }
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

    public CazarrecompensasDto.Resumen resumen(Long idCazarrecompensas) {
        return jdbc.queryForObject(
                "SELECT COALESCE((SELECT SUM(mv.monto) FROM movimiento mv JOIN billetera b ON b.id_billetera = mv.id_billetera "
                        + "WHERE b.id_cuenta = ? AND mv.tipo = 'COBRO'), 0) AS total_cobrado, "
                        + "COALESCE((SELECT SUM(mv.monto) FROM movimiento mv JOIN billetera b ON b.id_billetera = mv.id_billetera "
                        + "WHERE b.id_cuenta = ? AND mv.tipo = 'COBRO' AND mv.fecha >= NOW() - INTERVAL 30 DAY), 0) AS cobrado_30_dias, "
                        + "fn_misiones_completadas(?) AS misiones_completadas, "
                        + "(SELECT COUNT(*) FROM mision WHERE id_cazarrecompensas = ? AND estado IN ('ASIGNADA', 'EN_CURSO')) AS misiones_activas, "
                        + "(SELECT COUNT(*) FROM postulacion WHERE id_cazarrecompensas = ? AND estado_postulacion = 'PENDIENTE') AS postulaciones_pendientes, "
                        + "(SELECT COUNT(*) FROM calificacion c JOIN mision m ON m.id_mision = c.id_mision WHERE m.id_cazarrecompensas = ?) AS calificaciones, "
                        + "(SELECT reputacion FROM cazarrecompensas WHERE id_cazarrecompensas = ?) AS reputacion, "
                        + "fn_saldo_disponible(?) AS saldo_disponible",
                (rs, i) -> new CazarrecompensasDto.Resumen(rs.getBigDecimal("total_cobrado"),
                        rs.getBigDecimal("cobrado_30_dias"), rs.getInt("misiones_completadas"),
                        rs.getInt("misiones_activas"), rs.getInt("postulaciones_pendientes"),
                        rs.getInt("calificaciones"), rs.getBigDecimal("reputacion"),
                        rs.getBigDecimal("saldo_disponible")),
                idCazarrecompensas, idCazarrecompensas, idCazarrecompensas, idCazarrecompensas,
                idCazarrecompensas, idCazarrecompensas, idCazarrecompensas, idCazarrecompensas);
    }

    public void actualizar(Long idCazarrecompensas, Long idZona, String biografia, String disponibilidad) {
        procedimientos.llamar("sp_actualizar_cazarrecompensas", idCazarrecompensas, idZona, biografia, disponibilidad);
    }
}
