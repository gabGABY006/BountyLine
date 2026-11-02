package co.edu.unbosque.bountyline.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Registro e inicio de sesión. */
public final class CuentaDtos {

    private CuentaDtos() {
    }

    public record EspecialidadNivel(@NotNull Long id, @NotNull @Min(1) @Max(5) Integer nivel) {
    }

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

    public record Id(Long id) {
    }
}
