package co.edu.unbosque.bountyline.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos de entrada para crear zonas y especialidades (supuesto S32). */
public final class CatalogoDtos {

    private CatalogoDtos() {
    }

    public record NuevaZona(
            @NotNull Long idAdministrador,
            @NotBlank @Size(max = 60) String nombre,
            @Size(max = 300) String descripcion,
            @NotNull @Min(1) @Max(5) Integer nivelPeligro) {
    }

    public record NuevaEspecialidad(
            @NotNull Long idAdministrador,
            @NotBlank @Size(max = 60) String nombre,
            @Size(max = 300) String descripcion) {
    }
}
