package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.ReporteDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.ReporteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService servicio;

    public ReporteController(ReporteService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<ReporteDto> listar(@RequestParam(required = false) String estado) {
        return servicio.listar(estado);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ReporteDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public ReporteDto crear(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ReporteDto.Nuevo reporte) {
        return servicio.crear(Sesion.id(jwt), reporte);
    }

    @PostMapping("/{id}/resolucion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ReporteDto resolver(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                               @Valid @RequestBody ReporteDto.Resolucion resolucion) {
        return servicio.resolver(Sesion.id(jwt), id, resolucion);
    }
}
