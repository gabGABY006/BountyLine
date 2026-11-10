package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

public record BitacoraDto(String tipo, String accion, LocalDateTime fecha, Long idCuenta, String operador,
                          String referencia, Long idMision, String detalle) {
}
