package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.service.CuentaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService servicio;

    public CuentaController(CuentaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<CuentaDto> listar(@RequestParam(required = false) String rol,
                                  @RequestParam(required = false) String estado) {
        return servicio.listar(rol, estado);
    }

    @GetMapping("/{id}")
    public CuentaDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaDto.Sesion registrar(@Valid @RequestBody CuentaDto.Registro registro) {
        return servicio.registrar(registro);
    }

    @PostMapping("/login")
    public CuentaDto.Sesion login(@Valid @RequestBody CuentaDto.Login login) {
        return servicio.iniciarSesion(login);
    }

    @PutMapping("/{id}/correo")
    public CuentaDto cambiarCorreo(@PathVariable Long id, @Valid @RequestBody CuentaDto.CambioCorreo cambio) {
        return servicio.cambiarCorreo(id, cambio);
    }

    /** Suspender o reactivar una cuenta (solo administradores). */
    @PutMapping("/{id}/estado")
    public CuentaDto cambiarEstado(@PathVariable Long id, @Valid @RequestBody CuentaDto.CambioEstado cambio) {
        return servicio.cambiarEstado(id, cambio);
    }
}
