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

import co.edu.unbosque.bountyline.dto.CalificacionDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.CalificacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/calificaciones")
public class CalificacionController {

    private final CalificacionService servicio;

    public CalificacionController(CalificacionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<CalificacionDto> listar(@RequestParam(required = false) Long idMision,
                                        @RequestParam(required = false) Long idCazarrecompensas) {
        return servicio.listar(idMision, idCazarrecompensas);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USUARIO')")
    public List<CalificacionDto> calificar(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody CalificacionDto.Nueva calificacion) {
        return servicio.calificar(Sesion.id(jwt), calificacion);
    }
}
