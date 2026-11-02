package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.AuditoriaCuenta;

/** La auditoría solo se consulta; la llena el trigger trg_auditoria_cuenta (S76). */
@Repository
public class AuditoriaCuentaRepository {

    private final JdbcTemplate jdbc;

    public AuditoriaCuentaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<AuditoriaCuenta> listar(Long idCuenta) {
        StringBuilder sql = new StringBuilder(
                "SELECT id_auditoria, id_cuenta, campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, usuario_bd "
                        + "FROM auditoria_cuenta WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (idCuenta != null) {
            sql.append(" AND id_cuenta = ?");
            args.add(idCuenta);
        }
        sql.append(" ORDER BY fecha_cambio DESC, id_auditoria DESC");
        return jdbc.query(sql.toString(),
                (rs, i) -> new AuditoriaCuenta(rs.getLong("id_auditoria"), rs.getLong("id_cuenta"),
                        rs.getString("campo_modificado"), rs.getString("valor_anterior"),
                        rs.getString("valor_nuevo"), Filas.fecha(rs, "fecha_cambio"), rs.getString("usuario_bd")),
                args.toArray());
    }
}
