package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.ZonaDto;
import co.edu.unbosque.bountyline.service.ZonaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/zonas")
public class ZonaController {

    private final ZonaService servicio;

    public ZonaController(ZonaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<ZonaDto> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public ZonaDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ZonaDto crear(@Valid @RequestBody ZonaDto.Guardar zona) {
        return servicio.crear(zona);
    }

    @PutMapping("/{id}")
    public ZonaDto actualizar(@PathVariable Long id, @Valid @RequestBody ZonaDto.Guardar zona) {
        return servicio.actualizar(id, zona);
    }
}
