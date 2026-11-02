package co.edu.unbosque.bountyline.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Especialidad de un cazarrecompensas con su nivel (relación N:M). */
public record CazarrecompensasEspecialidadDto(Long idCazarrecompensas, Long idEspecialidad, String especialidad,
                                              Integer nivel) {

    public record Guardar(@NotNull Long idEspecialidad, @NotNull @Min(1) @Max(5) Integer nivel) {
    }
}
