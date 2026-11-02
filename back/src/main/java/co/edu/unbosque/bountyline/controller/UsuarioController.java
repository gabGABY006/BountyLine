package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.UsuarioDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<UsuarioDto> listar() {
        return servicio.listar();
    }

    @GetMapping("/yo")
    @PreAuthorize("hasRole('USUARIO')")
    public UsuarioDto yo(@AuthenticationPrincipal Jwt jwt) {
        return servicio.buscar(Sesion.id(jwt));
    }

    @GetMapping("/{id}")
    public UsuarioDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    /** El usuario actualiza su propio perfil. */
    @PutMapping("/yo")
    @PreAuthorize("hasRole('USUARIO')")
    public UsuarioDto actualizar(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody UsuarioDto.Actualizacion actualizacion) {
        return servicio.actualizar(Sesion.id(jwt), actualizacion);
    }
}
