package co.edu.unbosque.bountyline.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.BilleteraDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.BilleteraService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/billeteras")
public class BilleteraController {

    private final BilleteraService servicio;

    public BilleteraController(BilleteraService servicio) {
        this.servicio = servicio;
    }

    /** Billetera de la cuenta autenticada. */
    @GetMapping("/yo")
    public BilleteraDto mia(@AuthenticationPrincipal Jwt jwt) {
        return servicio.buscarPorCuenta(Sesion.id(jwt));
    }

    @GetMapping("/{idCuenta}")
    public BilleteraDto buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long idCuenta) {
        Sesion.exigirPropiaOAdministrador(jwt, idCuenta);
        return servicio.buscarPorCuenta(idCuenta);
    }

    /** Recarga simulada de créditos en la propia billetera. */
    @PostMapping("/yo/recargas")
    @PreAuthorize("hasAnyRole('USUARIO', 'CAZARRECOMPENSAS')")
    public BilleteraDto recargar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BilleteraDto.Recarga recarga) {
        return servicio.recargar(Sesion.id(jwt), recarga);
    }
}
