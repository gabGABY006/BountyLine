package co.edu.unbosque.bountyline.dto;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PublicacionDto(String id, Long idCuenta, String alias, String rol, String texto, List<String> etiquetas,
                             Long idZona, String zona, Long idMision, Reacciones reacciones, String miReaccion,
                             List<ComentarioDto> comentarios, String estadoModeracion, Instant fechaPublicacion,
                             Instant fechaEdicion) {

    public record Reacciones(int meGusta, int fuego, int alerta) {
    }

    public record Nueva(@NotBlank @Size(max = 1000) String texto,
                        @Size(max = 10) List<@Pattern(regexp = "[a-z0-9_]{2,30}") String> etiquetas,
                        Long idZona, Long idMision) {
    }

    public record Edicion(@NotBlank @Size(max = 1000) String texto,
                          @Size(max = 10) List<@Pattern(regexp = "[a-z0-9_]{2,30}") String> etiquetas) {
    }

    public record NuevoComentario(@NotBlank @Size(max = 500) String texto) {
    }

    public record NuevaReaccion(@NotBlank @Pattern(regexp = "me_gusta|fuego|alerta") String tipo) {
    }

    public record Moderacion(@NotBlank @Pattern(regexp = "VISIBLE|OCULTA|OCULTO") String estado) {
    }
}
