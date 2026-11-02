package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.unbosque.bountyline.model.Cuenta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos públicos de una cuenta (nunca incluye el hash de la contraseña). */
public record CuentaDto(Long idCuenta, String correo, String alias, String rol, String estado,
                        LocalDateTime fechaRegistro) {

    public static CuentaDto desde(Cuenta c) {
        return new CuentaDto(c.getIdCuenta(), c.getCorreo(), c.getAlias(), c.getRol(), c.getEstado(),
                c.getFechaRegistro());
    }

    public record EspecialidadNivel(@NotNull Long id, @NotNull @Min(1) @Max(5) Integer nivel) {
    }

    /** Registro de Usuario o Cazarrecompensas (los administradores se crean por script, S30). */
    public record Registro(
            @NotBlank @Email @Size(max = 120) String correo,
            @NotBlank @Size(max = 40) String alias,
            @NotBlank @Size(min = 8, max = 72) String contrasena,
            @NotBlank @Pattern(regexp = "USUARIO|CAZARRECOMPENSAS") String rol,
            @Size(max = 500) String biografia,
            Long idZona,
            List<@Valid EspecialidadNivel> especialidades) {
    }

    public record Login(@NotBlank String correo, @NotBlank String contrasena) {
    }

    public record Sesion(Long idCuenta, String alias, String rol) {
    }

    public record CambioCorreo(@NotBlank @Email @Size(max = 120) String correo) {
    }

    public record CambioEstado(@NotNull Long idAdministrador,
                               @NotBlank @Pattern(regexp = "ACTIVA|SUSPENDIDA") String estado) {
    }
}
