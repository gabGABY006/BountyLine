package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unbosque.bountyline.model.Movimiento;

public record MovimientoDto(Long idMovimiento, Long idBilletera, Long idMision, String tipo, BigDecimal monto,
                            LocalDateTime fecha, String descripcion) {

    public static MovimientoDto desde(Movimiento m) {
        return new MovimientoDto(m.getIdMovimiento(), m.getIdBilletera(), m.getIdMision(), m.getTipo(), m.getMonto(),
                m.getFecha(), m.getDescripcion());
    }
}
