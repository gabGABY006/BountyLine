package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Fila de la vista v_mision_detalle. */
public record MisionDto(Long idMision, String titulo, String descripcion, BigDecimal montoRecompensa, String estado,
                        LocalDateTime fechaPublicacion, LocalDateTime fechaCierre,
                        Long idUsuario, String aliasUsuario, Long idZona, String zona,
                        Long idEspecialidad, String especialidad,
                        Long idCazarrecompensas, String aliasCazarrecompensas, Integer postulaciones) {

    /** El usuario que publica se toma del token. */
    public record Nueva(@NotNull Long idZona, @NotNull Long idEspecialidad,
                        @NotBlank @Size(max = 120) String titulo, @NotBlank String descripcion,
                        @NotNull @Positive BigDecimal monto) {
    }

    public record Asignacion(@NotNull Long idCazarrecompensas) {
    }

    /** Resultado de sp_sugerir_cazarrecompensas. */
    public record Sugerencia(Long idCazarrecompensas, String alias, String zona, BigDecimal reputacion,
                             Integer misionesCompletadas, Integer puntaje) {
    }
}
