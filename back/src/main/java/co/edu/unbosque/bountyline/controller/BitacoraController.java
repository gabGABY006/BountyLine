package co.edu.unbosque.bountyline.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.BitacoraDto;
import co.edu.unbosque.bountyline.service.BitacoraService;

/** Bitácora del administrador: pagos, misiones, reportes y cambios de cuenta en orden de fecha. */
@RestController
@RequestMapping("/api/bitacora")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class BitacoraController {

    private final BitacoraService servicio;

    public BitacoraController(BitacoraService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<BitacoraDto> listar(@RequestParam(required = false) String tipo,
                                    @RequestParam(required = false) Long idCuenta,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                    @RequestParam(defaultValue = "100") int limite) {
        return servicio.listar(tipo, idCuenta, desde, hasta, limite);
    }
}
