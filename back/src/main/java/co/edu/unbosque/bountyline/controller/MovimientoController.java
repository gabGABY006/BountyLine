package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.MovimientoDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.MovimientoService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService servicio;

    public MovimientoController(MovimientoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<MovimientoDto> listar(@AuthenticationPrincipal Jwt jwt,
                                      @RequestParam(required = false) Long idCuenta,
                                      @RequestParam(required = false) Long idMision,
                                      @RequestParam(defaultValue = "50") int limite) {
        Long cuenta = Sesion.esAdministrador(jwt) ? idCuenta : Sesion.id(jwt);
        return servicio.listar(cuenta, idMision, limite);
    }
}
