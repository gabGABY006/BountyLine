package com.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.bountyline.dto.ReporteDtos;

@Repository
public class ReporteRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public ReporteRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<ReporteDtos.Reporte> listar(String estado) {
        StringBuilder sql = new StringBuilder(
                "SELECT r.id_reporte, r.id_cuenta_reporta, a.alias AS alias_reporta, r.id_cuenta_reportada, "
                        + "b.alias AS alias_reportada, r.id_contenido, r.id_administrador, r.motivo, r.estado, "
                        + "r.fecha_reporte, r.fecha_resolucion FROM reporte r "
                        + "JOIN cuenta a ON a.id_cuenta = r.id_cuenta_reporta "
                        + "LEFT JOIN cuenta b ON b.id_cuenta = r.id_cuenta_reportada WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND r.estado = ?");
            args.add(estado);
        }
        sql.append(" ORDER BY r.fecha_reporte DESC, r.id_reporte DESC");
        return jdbc.query(sql.toString(),
                (rs, i) -> new ReporteDtos.Reporte(rs.getLong("id_reporte"), rs.getLong("id_cuenta_reporta"),
                        rs.getString("alias_reporta"), Filas.largo(rs, "id_cuenta_reportada"),
                        rs.getString("alias_reportada"), rs.getString("id_contenido"),
                        Filas.largo(rs, "id_administrador"), rs.getString("motivo"), rs.getString("estado"),
                        Filas.fecha(rs, "fecha_reporte"), Filas.fecha(rs, "fecha_resolucion")),
                args.toArray());
    }

    public Long crear(ReporteDtos.NuevoReporte r) {
        return procedimientos.llamarConSalida("sp_crear_reporte",
                r.idCuentaReporta(), r.idCuentaReportada(), r.idContenido(), r.motivo());
    }

    public void resolver(Long idReporte, ReporteDtos.Resolucion r) {
        procedimientos.llamar("sp_resolver_reporte", idReporte, r.idAdministrador(), r.estado(), r.suspender());
    }
}
