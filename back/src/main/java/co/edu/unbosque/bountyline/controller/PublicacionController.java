package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.PublicacionDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.PublicacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionController {

    private final PublicacionService servicio;

    public PublicacionController(PublicacionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PublicacionDto> listar(@AuthenticationPrincipal Jwt jwt,
                                       @RequestParam(required = false) String etiqueta,
                                       @RequestParam(required = false) Long idZona,
                                       @RequestParam(required = false) Long idCuenta,
                                       @RequestParam(required = false) Long idMision,
                                       @RequestParam(required = false) String texto,
                                       @RequestParam(defaultValue = "0") int pagina,
                                       @RequestParam(defaultValue = "20") int tamano) {
        return servicio.listar(Sesion.id(jwt), Sesion.esAdministrador(jwt), etiqueta, idZona, idCuenta, idMision,
                texto, pagina, tamano);
    }

    @GetMapping("/{id}")
    public PublicacionDto buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return servicio.buscar(id, Sesion.id(jwt), Sesion.esAdministrador(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public PublicacionDto publicar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PublicacionDto.Nueva nueva) {
        return servicio.publicar(Sesion.id(jwt), jwt.getClaimAsString("alias"), Sesion.rol(jwt), nueva);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public PublicacionDto editar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                                 @Valid @RequestBody PublicacionDto.Edicion edicion) {
        return servicio.editar(id, Sesion.id(jwt), edicion);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        servicio.eliminar(id, Sesion.id(jwt), Sesion.esAdministrador(jwt));
    }

    @PostMapping("/{id}/comentarios")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public PublicacionDto comentar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                                   @Valid @RequestBody PublicacionDto.NuevoComentario comentario) {
        return servicio.comentar(id, Sesion.id(jwt), jwt.getClaimAsString("alias"), comentario);
    }

    @PostMapping("/{id}/reacciones")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public PublicacionDto reaccionar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                                     @Valid @RequestBody PublicacionDto.NuevaReaccion reaccion) {
        return servicio.reaccionar(id, Sesion.id(jwt), reaccion.tipo());
    }

    @PutMapping("/{id}/moderacion")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public PublicacionDto moderar(@PathVariable String id, @Valid @RequestBody PublicacionDto.Moderacion m) {
        return servicio.moderar(id, m.estado());
    }

    @PutMapping("/comentarios/{idComentario}/moderacion")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void moderarComentario(@PathVariable String idComentario, @Valid @RequestBody PublicacionDto.Moderacion m) {
        servicio.moderarComentario(idComentario, m.estado());
    }
}
