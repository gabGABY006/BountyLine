package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.AdministradorDto;
import co.edu.unbosque.bountyline.service.AdministradorService;

/** Los administradores se crean por script (S30); aquí solo se consultan. */
@RestController
@RequestMapping("/api/administradores")
public class AdministradorController {

    private final AdministradorService servicio;

    public AdministradorController(AdministradorService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<AdministradorDto> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public AdministradorDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }
}
