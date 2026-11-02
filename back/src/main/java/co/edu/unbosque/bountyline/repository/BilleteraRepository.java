package co.edu.unbosque.bountyline.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.BilleteraDtos;

@Repository
public class BilleteraRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public BilleteraRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public Optional<BilleteraDtos.Billetera> porCuenta(Long idCuenta, int limiteMovimientos) {
        List<BilleteraDtos.Billetera> filas = jdbc.query(
                "SELECT id_billetera, id_cuenta, saldo_disponible, saldo_retenido, fecha_actualizacion "
                        + "FROM billetera WHERE id_cuenta = ?",
                (rs, i) -> {
                    Long idBilletera = rs.getLong("id_billetera");
                    return new BilleteraDtos.Billetera(idBilletera, rs.getLong("id_cuenta"),
                            rs.getBigDecimal("saldo_disponible"), rs.getBigDecimal("saldo_retenido"),
                            Filas.fecha(rs, "fecha_actualizacion"), movimientos(idBilletera, limiteMovimientos));
                },
                idCuenta);
        return filas.stream().findFirst();
    }

    private List<BilleteraDtos.Movimiento> movimientos(Long idBilletera, int limite) {
        return jdbc.query(
                "SELECT id_movimiento, tipo, monto, fecha, descripcion, id_mision FROM movimiento "
                        + "WHERE id_billetera = ? ORDER BY fecha DESC, id_movimiento DESC LIMIT ?",
                (rs, i) -> new BilleteraDtos.Movimiento(rs.getLong("id_movimiento"), rs.getString("tipo"),
                        rs.getBigDecimal("monto"), Filas.fecha(rs, "fecha"), rs.getString("descripcion"),
                        Filas.largo(rs, "id_mision")),
                idBilletera, limite);
    }

    public void recargar(Long idCuenta, BigDecimal monto) {
        procedimientos.llamar("sp_recargar_saldo", idCuenta, monto);
    }
}
