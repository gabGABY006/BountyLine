package co.edu.unbosque.bountyline.dto;

import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos de registro, inicio de sesión y la sesión que se devuelve con el token. */
public final class AuthDto {

    private AuthDto() {
    }

    /** Especialidad elegida al registrarse; si no se indica el nivel se toma 1. */
    public record EspecialidadNivel(@NotNull Long id, @Min(1) @Max(5) Integer nivel) {
    }

    /** Registro de Usuario o Cazarrecompensas (los administradores se crean por script, S30). */
    public record Registro(
            @NotBlank @Email @Size(max = 120) String correo,
            @NotBlank @Size(min = 3, max = 40) String alias,
            @NotBlank @Size(min = 8, max = 72) String contrasena,
            @NotBlank @Pattern(regexp = "USUARIO|CAZARRECOMPENSAS") String rol,
            @Size(max = 500) String biografia,
            Long idZona,
            List<@Valid EspecialidadNivel> especialidades) {
    }

    public record Login(@NotBlank String correo, @NotBlank String contrasena) {
    }

    /** Respuesta del registro y del inicio de sesión. */
    public record Sesion(String token, String tipo, Instant expira, Long idCuenta, String alias, String rol) {
    }
}
