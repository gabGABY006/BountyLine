package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.CuentaService;
import jakarta.validation.Valid;

/** Consulta y gestión de cuentas. El registro y el inicio de sesión están en /api/auth. */
@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService servicio;

    public CuentaController(CuentaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<CuentaDto> listar(@RequestParam(required = false) String rol,
                                  @RequestParam(required = false) String estado) {
        return servicio.listar(rol, estado);
    }

    @GetMapping("/{id}")
    public CuentaDto buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        Sesion.exigirPropiaOAdministrador(jwt, id);
        return servicio.buscar(id);
    }

    /** Cada cuenta cambia su propio correo. */
    @PutMapping("/yo/correo")
    public CuentaDto cambiarCorreo(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CuentaDto.CambioCorreo cambio) {
        return servicio.cambiarCorreo(Sesion.id(jwt), cambio);
    }

    /** Cada cuenta cambia su propia contraseña. Responde 204 sin cuerpo. */
    @PutMapping("/yo/contrasena")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarContrasena(@AuthenticationPrincipal Jwt jwt,
                                  @Valid @RequestBody CuentaDto.CambioContrasena cambio) {
        servicio.cambiarContrasena(Sesion.id(jwt), cambio);
    }

    /** Suspender o reactivar una cuenta (solo administradores). */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CuentaDto cambiarEstado(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                   @Valid @RequestBody CuentaDto.CambioEstado cambio) {
        return servicio.cambiarEstado(Sesion.id(jwt), id, cambio);
    }
}
