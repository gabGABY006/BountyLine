package co.edu.unbosque.bountyline.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.BilleteraDto;
import co.edu.unbosque.bountyline.service.BilleteraService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/billeteras")
public class BilleteraController {

    private final BilleteraService servicio;

    public BilleteraController(BilleteraService servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/{idCuenta}")
    public BilleteraDto buscar(@PathVariable Long idCuenta) {
        return servicio.buscarPorCuenta(idCuenta);
    }

    /** Recarga simulada de créditos. */
    @PostMapping("/{idCuenta}/recargas")
    public BilleteraDto recargar(@PathVariable Long idCuenta, @Valid @RequestBody BilleteraDto.Recarga recarga) {
        return servicio.recargar(idCuenta, recarga);
    }
}
