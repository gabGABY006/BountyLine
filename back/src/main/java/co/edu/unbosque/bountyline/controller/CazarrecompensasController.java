package co.edu.unbosque.bountyline.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
import co.edu.unbosque.bountyline.service.ActividadService;
import co.edu.unbosque.bountyline.service.CazarrecompensasService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cazarrecompensas")
public class CazarrecompensasController {

    private final CazarrecompensasService servicio;
    private final ActividadService actividad;

    public CazarrecompensasController(CazarrecompensasService servicio, ActividadService actividad) {
        this.servicio = servicio;
        this.actividad = actividad;
    }

    @GetMapping
    public List<CazarrecompensasDto> listar(@AuthenticationPrincipal Jwt jwt,
                                            @RequestParam(required = false) String alias,
                                            @RequestParam(required = false) Long idZona,
                                            @RequestParam(required = false) Long idEspecialidad,
                                            @RequestParam(required = false) String disponibilidad) {
        List<CazarrecompensasDto> lista = servicio.listar(alias, idZona, idEspecialidad, disponibilidad);
        Map<String, Object> filtros = new LinkedHashMap<>();
        filtros.put("alias", alias);
        filtros.put("id_zona", idZona);
        filtros.put("id_especialidad", idEspecialidad);
        filtros.put("disponibilidad", disponibilidad);
        actividad.busqueda(Sesion.id(jwt), Sesion.rol(jwt), "buscar_cazadores", filtros, lista.size());
        return lista;
    }

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
    public CazarrecompensasDto buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        CazarrecompensasDto perfil = servicio.buscar(id);
        if (!id.equals(Sesion.id(jwt))) {
            actividad.vistaPerfil(Sesion.id(jwt), Sesion.rol(jwt), id);
        }
        return perfil;
    }

    @PutMapping("/yo")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public CazarrecompensasDto actualizar(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody CazarrecompensasDto.Actualizacion actualizacion) {
        return servicio.actualizar(Sesion.id(jwt), actualizacion);
    }
}
