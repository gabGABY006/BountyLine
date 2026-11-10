package co.edu.unbosque.bountyline.dto;

import java.time.Instant;

/** Comentario de una publicación; el id es el ObjectId en hexadecimal (se puede reportar, S72). */
public record ComentarioDto(String id, Long idCuenta, String alias, String texto, Instant fecha,
                            String estadoModeracion) {
}
