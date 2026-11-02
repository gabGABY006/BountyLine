package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public final class BilleteraDtos {

    private BilleteraDtos() {
    }

    public record Movimiento(Long idMovimiento, String tipo, BigDecimal monto, LocalDateTime fecha,
                             String descripcion, Long idMision) {
    }

    public record Billetera(Long idBilletera, Long idCuenta, BigDecimal saldoDisponible, BigDecimal saldoRetenido,
                            LocalDateTime fechaActualizacion, List<Movimiento> movimientos) {
    }

    public record Recarga(@NotNull @Positive BigDecimal monto) {
    }
}
