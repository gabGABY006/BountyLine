package co.edu.unbosque.bountyline.dto;

import co.edu.unbosque.bountyline.model.Especialidad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EspecialidadDto(Long idEspecialidad, String nombre, String descripcion, Long idAdministrador) {

    public static EspecialidadDto desde(Especialidad e) {
        return new EspecialidadDto(e.getIdEspecialidad(), e.getNombre(), e.getDescripcion(), e.getIdAdministrador());
    }

    /** Datos para crear o modificar una especialidad (solo administradores, S32). */
    public record Guardar(@NotBlank @Size(max = 60) String nombre,
                          @Size(max = 300) String descripcion) {
    }
}
