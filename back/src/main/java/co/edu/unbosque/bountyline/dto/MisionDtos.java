package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public final class MisionDtos {

    private MisionDtos() {
    }

    /** Fila de la vista v_mision_detalle. */
    public record Mision(Long idMision, String titulo, String descripcion, BigDecimal montoRecompensa, String estado,
                         LocalDateTime fechaPublicacion, LocalDateTime fechaCierre,
                         Long idUsuario, String aliasUsuario, Long idZona, String zona,
                         Long idEspecialidad, String especialidad,
                         Long idCazarrecompensas, String aliasCazarrecompensas, Integer postulaciones) {
    }

    public record Postulacion(Long idCazarrecompensas, String alias, LocalDateTime fechaPostulacion,
                              String mensaje, String estado, Integer puntaje) {
    }

    public record Sugerencia(Long idCazarrecompensas, String alias, String zona, BigDecimal reputacion,
                             Integer misionesCompletadas, Integer puntaje) {
    }

    public record NuevaMision(
            @NotNull Long idUsuario,
            @NotNull Long idZona,
            @NotNull Long idEspecialidad,
            @NotBlank @Size(max = 120) String titulo,
            @NotBlank String descripcion,
            @NotNull @Positive BigDecimal monto) {
    }

    public record NuevaPostulacion(@NotNull Long idCazarrecompensas, @Size(max = 500) String mensaje) {
    }

    public record Asignacion(@NotNull Long idUsuario, @NotNull Long idCazarrecompensas) {
    }

    public record Inicio(@NotNull Long idCazarrecompensas) {
    }

    public record Cierre(@NotNull Long idUsuario) {
    }

    /** La cancela su usuario (idUsuario) o un administrador (idAdministrador). */
    public record Cancelacion(Long idUsuario, Long idAdministrador) {
    }

    public record Calificacion(@NotNull Long idUsuario, @NotNull @Min(1) @Max(5) Integer puntaje,
                               @Size(max = 500) String comentario) {
    }
}
