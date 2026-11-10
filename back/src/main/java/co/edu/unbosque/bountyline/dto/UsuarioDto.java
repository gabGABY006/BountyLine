package co.edu.unbosque.bountyline.dto;

import jakarta.validation.constraints.Size;

public record UsuarioDto(Long idUsuario, String alias, String correo, String estado, String biografia,
                         Integer misionesPublicadas) {

    public record Actualizacion(@Size(max = 500) String biografia) {
    }
}
