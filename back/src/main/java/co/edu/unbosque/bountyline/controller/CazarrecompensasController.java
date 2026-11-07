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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CazarrecompensasDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.CazarrecompensasService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cazarrecompensas")
public class CazarrecompensasController {

    private final CazarrecompensasService servicio;

    public CazarrecompensasController(CazarrecompensasService servicio) {
        this.servicio = servicio;
    }

    /** Búsqueda manual con filtros (RF-06). Solo muestra cuentas activas. */
    @GetMapping
    public List<CazarrecompensasDto> listar(@RequestParam(required = false) String alias,
                                            @RequestParam(required = false) Long idZona,
                                            @RequestParam(required = false) Long idEspecialidad,
                                            @RequestParam(required = false) String disponibilidad) {
        return servicio.listar(alias, idZona, idEspecialidad, disponibilidad);
    }

    /** Totales de la pantalla de ganancias. */
    @GetMapping("/yo/resumen")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public CazarrecompensasDto.Resumen resumen(@AuthenticationPrincipal Jwt jwt) {
        return servicio.resumen(Sesion.id(jwt));
    }

    @GetMapping("/yo")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public CazarrecompensasDto yo(@AuthenticationPrincipal Jwt jwt) {
        return servicio.buscar(Sesion.id(jwt));
    }

    @GetMapping("/{id}")
    public CazarrecompensasDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    /** El cazarrecompensas actualiza su propio perfil. */
    @PutMapping("/yo")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public CazarrecompensasDto actualizar(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody CazarrecompensasDto.Actualizacion actualizacion) {
        return servicio.actualizar(Sesion.id(jwt), actualizacion);
    }
}
