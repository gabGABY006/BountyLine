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

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.MisionService;
import jakarta.validation.Valid;

/**
 * Ciclo de vida de la misión. Quién hace cada acción sale del token; el
 * procedimiento almacenado comprueba que sea el dueño o el asignado.
 */
@RestController
@RequestMapping("/api/misiones")
public class MisionController {

    private final MisionService servicio;

    public MisionController(MisionService servicio) {
        this.servicio = servicio;
    }

    /** Búsqueda de misiones; el mercado del cazarrecompensas usa estado=PUBLICADA con zona, especialidad y texto. */
    @GetMapping
    public List<MisionDto> listar(@RequestParam(required = false) String estado,
                                  @RequestParam(required = false) Long idUsuario,
                                  @RequestParam(required = false) Long idCazarrecompensas,
                                  @RequestParam(required = false) Long idZona,
                                  @RequestParam(required = false) Long idEspecialidad,
                                  @RequestParam(required = false) String texto) {
        return servicio.listar(new MisionDto.Filtro(estado, idUsuario, idCazarrecompensas, idZona, idEspecialidad, texto));
    }

    /** Misiones publicadas por el usuario o asignadas al cazarrecompensas autenticado. */
    @GetMapping("/mias")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public List<MisionDto> mias(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String estado) {
        Long id = Sesion.id(jwt);
        return Sesion.USUARIO.equals(Sesion.rol(jwt))
                ? servicio.listar(new MisionDto.Filtro(estado, id, null, null, null, null))
                : servicio.listar(new MisionDto.Filtro(estado, null, id, null, null, null));
    }

    @GetMapping("/{id}")
    public MisionDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USUARIO')")
    public MisionDto publicar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MisionDto.Nueva nueva) {
        return servicio.publicar(Sesion.id(jwt), nueva);
    }

    @GetMapping("/{id}/sugerencias")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public List<MisionDto.Sugerencia> sugerencias(@PathVariable Long id, @RequestParam(defaultValue = "5") int limite) {
        return servicio.sugerencias(id, limite);
    }

    @PostMapping("/{id}/asignacion")
    @PreAuthorize("hasRole('USUARIO')")
    public MisionDto asignar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                             @Valid @RequestBody MisionDto.Asignacion a) {
        return servicio.asignar(Sesion.id(jwt), id, a);
    }

    @PostMapping("/{id}/inicio")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public MisionDto iniciar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return servicio.iniciar(Sesion.id(jwt), id);
    }

    @PostMapping("/{id}/cierre")
    @PreAuthorize("hasRole('USUARIO')")
    public MisionDto cerrar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return servicio.cerrar(Sesion.id(jwt), id);
    }

    @PostMapping("/{id}/cancelacion")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public MisionDto cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return servicio.cancelar(Sesion.id(jwt), Sesion.esAdministrador(jwt), id);
    }
}
