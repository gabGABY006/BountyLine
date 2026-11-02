package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import co.edu.unbosque.bountyline.model.Billetera;
import co.edu.unbosque.bountyline.model.Movimiento;

public final class BilleteraDtos {

    private BilleteraDtos() {
    }

    /** Saldo de la billetera con sus últimos movimientos. */
    public record Resumen(Billetera billetera, List<Movimiento> movimientos) {
    }

    public record Recarga(@NotNull @Positive BigDecimal monto) {
    }
}
