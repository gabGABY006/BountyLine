package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Postulación con el alias del cazarrecompensas y su puntaje de emparejamiento. */
public record PostulacionDto(Long idMision, Long idCazarrecompensas, String alias, LocalDateTime fechaPostulacion,
                             String mensaje, String estadoPostulacion, Integer puntaje) {

    public record Nueva(@NotNull Long idMision, @Size(max = 500) String mensaje) {
    }
}
