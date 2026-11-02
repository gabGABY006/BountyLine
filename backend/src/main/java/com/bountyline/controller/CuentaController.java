package com.bountyline.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bountyline.dto.CuentaDtos;
import com.bountyline.service.CuentaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService servicio;

    public CuentaController(CuentaService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaDtos.Sesion registrar(@Valid @RequestBody CuentaDtos.Registro registro) {
        return servicio.registrar(registro);
    }

    @PostMapping("/login")
    public CuentaDtos.Sesion login(@Valid @RequestBody CuentaDtos.Login login) {
        return servicio.iniciarSesion(login);
    }
}
