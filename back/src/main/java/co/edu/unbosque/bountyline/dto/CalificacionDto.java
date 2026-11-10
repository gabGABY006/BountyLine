package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CalificacionDto(Long idCalificacion, Long idMision, Long idCazarrecompensas, String aliasCazarrecompensas,
                              Integer puntaje, String comentario, LocalDateTime fecha) {

    public record Nueva(@NotNull Long idMision, @NotNull @Min(1) @Max(5) Integer puntaje,
                        @Size(max = 500) String comentario) {
    }
}
