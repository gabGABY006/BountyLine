package com.bountyline.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bountyline.dto.BilleteraDtos;
import com.bountyline.exception.NoEncontradoException;
import com.bountyline.repository.BilleteraRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/billeteras")
public class BilleteraController {

    private final BilleteraRepository billeteras;

    public BilleteraController(BilleteraRepository billeteras) {
        this.billeteras = billeteras;
    }

    /** Saldo y últimos movimientos de la billetera de una cuenta. */
    @GetMapping("/{idCuenta}")
    public BilleteraDtos.Billetera ver(@PathVariable Long idCuenta,
                                       @RequestParam(defaultValue = "50") int movimientos) {
        return billeteras.porCuenta(idCuenta, movimientos)
                .orElseThrow(() -> new NoEncontradoException("La cuenta no tiene billetera."));
    }

    /** Recarga simulada de créditos (sp_recargar_saldo). */
    @PostMapping("/{idCuenta}/recargas")
    public BilleteraDtos.Billetera recargar(@PathVariable Long idCuenta,
                                            @Valid @RequestBody BilleteraDtos.Recarga recarga) {
        billeteras.recargar(idCuenta, recarga.monto());
        return ver(idCuenta, 50);
    }
}
