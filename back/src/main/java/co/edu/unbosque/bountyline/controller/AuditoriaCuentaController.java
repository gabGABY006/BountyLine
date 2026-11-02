package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.AuditoriaCuentaDto;
import co.edu.unbosque.bountyline.service.AuditoriaCuentaService;

/** Bitácora de cambios de correo y estado de las cuentas (solo administradores). */
@RestController
@RequestMapping("/api/auditoria-cuentas")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AuditoriaCuentaController {

    private final AuditoriaCuentaService servicio;

    public AuditoriaCuentaController(AuditoriaCuentaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<AuditoriaCuentaDto> listar(@RequestParam(required = false) Long idCuenta) {
        return servicio.listar(idCuenta);
    }
}
