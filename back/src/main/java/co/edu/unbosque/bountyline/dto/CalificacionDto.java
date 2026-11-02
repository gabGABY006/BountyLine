package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Calificación de una misión con el cazarrecompensas que la ejecutó. */
public record CalificacionDto(Long idCalificacion, Long idMision, Long idCazarrecompensas, String aliasCazarrecompensas,
                              Integer puntaje, String comentario, LocalDateTime fecha) {

    public record Nueva(@NotNull Long idMision, @NotNull Long idUsuario, @NotNull @Min(1) @Max(5) Integer puntaje,
                        @Size(max = 500) String comentario) {
    }
}
