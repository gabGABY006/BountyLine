package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import co.edu.unbosque.bountyline.model.Cuenta;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos públicos de una cuenta (nunca incluye el hash de la contraseña). */
public record CuentaDto(Long idCuenta, String correo, String alias, String rol, String estado,
                        LocalDateTime fechaRegistro) {

    public static CuentaDto desde(Cuenta c) {
        return new CuentaDto(c.getIdCuenta(), c.getCorreo(), c.getAlias(), c.getRol(), c.getEstado(),
                c.getFechaRegistro());
    }

    /** La contraseña actual se verifica antes de guardar la nueva. */
    public record CambioContrasena(@NotBlank String actual, @NotBlank @Size(min = 8, max = 72) String nueva) {
    }

    public record CambioCorreo(@NotBlank @Email @Size(max = 120) String correo) {
    }

    /** El administrador que hace el cambio se toma del token. */
    public record CambioEstado(@NotBlank @Pattern(regexp = "ACTIVA|SUSPENDIDA") String estado) {
    }
}
