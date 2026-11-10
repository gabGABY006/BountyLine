package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CazarrecompensasEspecialidadDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.CazarrecompensasEspecialidadService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cazarrecompensas")
public class CazarrecompensasEspecialidadController {

    private final CazarrecompensasEspecialidadService servicio;

    public CazarrecompensasEspecialidadController(CazarrecompensasEspecialidadService servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/{idCazarrecompensas}/especialidades")
    public List<CazarrecompensasEspecialidadDto> listar(@PathVariable Long idCazarrecompensas) {
        return servicio.listar(idCazarrecompensas);
    }

    @PostMapping("/yo/especialidades")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public List<CazarrecompensasEspecialidadDto> guardar(@AuthenticationPrincipal Jwt jwt,
                                                         @Valid @RequestBody CazarrecompensasEspecialidadDto.Guardar g) {
        return servicio.guardar(Sesion.id(jwt), g);
    }

    @DeleteMapping("/yo/especialidades/{idEspecialidad}")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public List<CazarrecompensasEspecialidadDto> quitar(@AuthenticationPrincipal Jwt jwt,
                                                        @PathVariable Long idEspecialidad) {
        return servicio.quitar(Sesion.id(jwt), idEspecialidad);
    }
}
