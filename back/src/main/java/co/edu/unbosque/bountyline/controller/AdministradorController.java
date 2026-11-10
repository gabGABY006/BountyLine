package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.AdministradorDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.AdministradorService;

@RestController
@RequestMapping("/api/administradores")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdministradorController {

    private final AdministradorService servicio;

    public AdministradorController(AdministradorService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<AdministradorDto> listar() {
        return servicio.listar();
    }

    @GetMapping("/yo")
    public AdministradorDto yo(@AuthenticationPrincipal Jwt jwt) {
        return servicio.buscar(Sesion.id(jwt));
    }

    @GetMapping("/{id}")
    public AdministradorDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }
}
