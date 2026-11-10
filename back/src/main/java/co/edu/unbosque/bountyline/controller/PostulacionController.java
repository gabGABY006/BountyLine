package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.PostulacionDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.PostulacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/postulaciones")
public class PostulacionController {

    private final PostulacionService servicio;

    public PostulacionController(PostulacionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PostulacionDto> listar(@RequestParam(required = false) Long idMision,
                                       @RequestParam(required = false) Long idCazarrecompensas) {
        return servicio.listar(idMision, idCazarrecompensas);
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public List<PostulacionDto> mias(@AuthenticationPrincipal Jwt jwt) {
        return servicio.listar(null, Sesion.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CAZARRECOMPENSAS')")
    public List<PostulacionDto> postular(@AuthenticationPrincipal Jwt jwt,
                                         @Valid @RequestBody PostulacionDto.Nueva postulacion) {
        return servicio.postular(Sesion.id(jwt), postulacion);
    }
}
