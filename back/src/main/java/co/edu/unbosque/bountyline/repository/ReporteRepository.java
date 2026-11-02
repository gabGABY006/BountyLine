package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.ReporteDto;

@Repository
public class ReporteRepository {

    private static final String SELECT_DETALLE =
            "SELECT r.id_reporte, r.id_cuenta_reporta, a.alias AS alias_reporta, r.id_cuenta_reportada, "
                    + "b.alias AS alias_reportada, r.id_contenido, r.id_administrador, r.motivo, r.estado, "
                    + "r.fecha_reporte, r.fecha_resolucion FROM reporte r "
                    + "JOIN cuenta a ON a.id_cuenta = r.id_cuenta_reporta "
                    + "LEFT JOIN cuenta b ON b.id_cuenta = r.id_cuenta_reportada";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public ReporteRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static ReporteDto mapear(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new ReporteDto(rs.getLong("id_reporte"), rs.getLong("id_cuenta_reporta"),
                rs.getString("alias_reporta"), Filas.largo(rs, "id_cuenta_reportada"),
                rs.getString("alias_reportada"), rs.getString("id_contenido"),
                Filas.largo(rs, "id_administrador"), rs.getString("motivo"), rs.getString("estado"),
                Filas.fecha(rs, "fecha_reporte"), Filas.fecha(rs, "fecha_resolucion"));
    }

    public List<ReporteDto> listar(String estado) {
        StringBuilder sql = new StringBuilder(SELECT_DETALLE).append(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND r.estado = ?");
            args.add(estado);
        }
        sql.append(" ORDER BY r.fecha_reporte DESC, r.id_reporte DESC");
        return jdbc.query(sql.toString(), ReporteRepository::mapear, args.toArray());
    }

    public Optional<ReporteDto> buscar(Long idReporte) {
        return jdbc.query(SELECT_DETALLE + " WHERE r.id_reporte = ?", ReporteRepository::mapear, idReporte)
                .stream().findFirst();
    }

    public Long crear(ReporteDto.Nuevo r) {
        return procedimientos.llamarConSalida("sp_crear_reporte",
                r.idCuentaReporta(), r.idCuentaReportada(), r.idContenido(), r.motivo());
    }

    public void resolver(Long idReporte, Long idAdministrador, String estado, boolean suspender) {
        procedimientos.llamar("sp_resolver_reporte", idReporte, idAdministrador, estado, suspender);
    }
}
