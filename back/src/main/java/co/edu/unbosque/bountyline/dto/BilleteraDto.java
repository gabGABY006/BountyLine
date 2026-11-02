package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unbosque.bountyline.model.Billetera;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BilleteraDto(Long idBilletera, Long idCuenta, BigDecimal saldoDisponible, BigDecimal saldoRetenido,
                           LocalDateTime fechaActualizacion) {

    public static BilleteraDto desde(Billetera b) {
        return new BilleteraDto(b.getIdBilletera(), b.getIdCuenta(), b.getSaldoDisponible(), b.getSaldoRetenido(),
                b.getFechaActualizacion());
    }

    public record Recarga(@NotNull @Positive BigDecimal monto) {
    }
}
