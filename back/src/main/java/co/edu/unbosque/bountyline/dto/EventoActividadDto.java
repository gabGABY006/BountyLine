package co.edu.unbosque.bountyline.dto;

import java.time.Instant;
import java.util.Map;

public record EventoActividadDto(String id, String tipo, Long idCuenta, String rol, Instant fecha, Boolean exito,
                                 String pantalla, Map<String, Object> filtros, Integer resultados, Long idMision,
                                 Long idCuentaVista) {
}
