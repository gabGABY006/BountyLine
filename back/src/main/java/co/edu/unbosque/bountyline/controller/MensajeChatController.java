package co.edu.unbosque.bountyline.controller;

import java.util.List;
import java.util.Map;

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

import co.edu.unbosque.bountyline.dto.MensajeChatDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.MensajeChatService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/misiones/{idMision}/chat")
public class MensajeChatController {

    private final MensajeChatService servicio;

    public MensajeChatController(MensajeChatService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<MensajeChatDto> listar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long idMision) {
        return servicio.listar(idMision, Sesion.id(jwt), Sesion.esAdministrador(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public MensajeChatDto enviar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long idMision,
                                 @Valid @RequestBody MensajeChatDto.Nuevo nuevo) {
        return servicio.enviar(idMision, Sesion.id(jwt), jwt.getClaimAsString("alias"), Sesion.rol(jwt), nuevo);
    }

    @GetMapping("/sin-leer")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public Map<String, Long> sinLeer(@AuthenticationPrincipal Jwt jwt, @PathVariable Long idMision) {
        return Map.of("sinLeer", servicio.sinLeer(idMision, Sesion.id(jwt)));
    }

    @PutMapping("/leidos")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public Map<String, Long> marcarLeidos(@AuthenticationPrincipal Jwt jwt, @PathVariable Long idMision) {
        return Map.of("marcados", servicio.marcarLeidos(idMision, Sesion.id(jwt)));
    }
}
