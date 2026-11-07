package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

/**
 * Evento de la bitácora del administrador (vista v_bitacora).
 * tipo: PAGO, MISION, REPORTE o CUENTA.
 */
public record BitacoraDto(String tipo, String accion, LocalDateTime fecha, Long idCuenta, String operador,
                          String referencia, Long idMision, String detalle) {
}
