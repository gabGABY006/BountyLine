package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Movimiento;

/** Los movimientos solo se consultan; los crean los procedimientos (S42, S48). */
@Repository
public class MovimientoRepository {

    private final JdbcTemplate jdbc;

    public MovimientoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Movimiento> listar(Long idCuenta, Long idMision, int limite) {
        StringBuilder sql = new StringBuilder(
                "SELECT m.id_movimiento, m.id_billetera, m.id_mision, m.tipo, m.monto, m.fecha, m.descripcion "
                        + "FROM movimiento m JOIN billetera b ON b.id_billetera = m.id_billetera WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (idCuenta != null) {
            sql.append(" AND b.id_cuenta = ?");
            args.add(idCuenta);
        }
        if (idMision != null) {
            sql.append(" AND m.id_mision = ?");
            args.add(idMision);
        }
        sql.append(" ORDER BY m.fecha DESC, m.id_movimiento DESC LIMIT ?");
        args.add(limite);
        return jdbc.query(sql.toString(),
                (rs, i) -> new Movimiento(rs.getLong("id_movimiento"), rs.getLong("id_billetera"),
                        Filas.largo(rs, "id_mision"), rs.getString("tipo"), rs.getBigDecimal("monto"),
                        Filas.fecha(rs, "fecha"), rs.getString("descripcion")),
                args.toArray());
    }
}
