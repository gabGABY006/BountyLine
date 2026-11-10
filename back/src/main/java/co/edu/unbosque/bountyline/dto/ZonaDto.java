package co.edu.unbosque.bountyline.dto;

import co.edu.unbosque.bountyline.model.Zona;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ZonaDto(Long idZona, String nombre, String descripcion, Integer nivelPeligro, Long idAdministrador) {

    public static ZonaDto desde(Zona z) {
        return new ZonaDto(z.getIdZona(), z.getNombre(), z.getDescripcion(), z.getNivelPeligro(),
                z.getIdAdministrador());
    }

    public record Guardar(@NotBlank @Size(max = 60) String nombre,
                          @Size(max = 300) String descripcion, @NotNull @Min(1) @Max(5) Integer nivelPeligro) {
    }
}
