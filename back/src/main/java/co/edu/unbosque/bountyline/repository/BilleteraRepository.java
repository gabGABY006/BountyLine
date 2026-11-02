package co.edu.unbosque.bountyline.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Billetera;
import co.edu.unbosque.bountyline.model.Movimiento;

@Repository
public class BilleteraRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public BilleteraRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public Optional<Billetera> porCuenta(Long idCuenta) {
        return jdbc.query(
                "SELECT id_billetera, id_cuenta, saldo_disponible, saldo_retenido, fecha_actualizacion "
                        + "FROM billetera WHERE id_cuenta = ?",
                (rs, i) -> new Billetera(rs.getLong("id_billetera"), rs.getLong("id_cuenta"),
                        rs.getBigDecimal("saldo_disponible"), rs.getBigDecimal("saldo_retenido"),
                        Filas.fecha(rs, "fecha_actualizacion")),
                idCuenta).stream().findFirst();
    }

    public List<Movimiento> movimientos(Long idBilletera, int limite) {
        return jdbc.query(
                "SELECT id_movimiento, id_billetera, id_mision, tipo, monto, fecha, descripcion FROM movimiento "
                        + "WHERE id_billetera = ? ORDER BY fecha DESC, id_movimiento DESC LIMIT ?",
                (rs, i) -> new Movimiento(rs.getLong("id_movimiento"), rs.getLong("id_billetera"),
                        Filas.largo(rs, "id_mision"), rs.getString("tipo"), rs.getBigDecimal("monto"),
                        Filas.fecha(rs, "fecha"), rs.getString("descripcion")),
                idBilletera, limite);
    }

    public void recargar(Long idCuenta, BigDecimal monto) {
        procedimientos.llamar("sp_recargar_saldo", idCuenta, monto);
    }
}
