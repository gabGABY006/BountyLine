package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.EspecialidadDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.EspecialidadService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {

    private final EspecialidadService servicio;

    public EspecialidadController(EspecialidadService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<EspecialidadDto> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public EspecialidadDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public EspecialidadDto crear(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EspecialidadDto.Guardar especialidad) {
        return servicio.crear(Sesion.id(jwt), especialidad);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public EspecialidadDto actualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                              @Valid @RequestBody EspecialidadDto.Guardar especialidad) {
        return servicio.actualizar(Sesion.id(jwt), id, especialidad);
    }
}
