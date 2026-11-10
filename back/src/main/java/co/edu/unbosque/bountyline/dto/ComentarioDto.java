package co.edu.unbosque.bountyline.dto;

import java.time.Instant;

public record ComentarioDto(String id, Long idCuenta, String alias, String texto, Instant fecha,
                            String estadoModeracion) {
}
