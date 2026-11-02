package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CatalogoDtos;
import co.edu.unbosque.bountyline.dto.CuentaDtos;
import co.edu.unbosque.bountyline.repository.CatalogoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    private final CatalogoRepository catalogos;

    public CatalogoController(CatalogoRepository catalogos) {
        this.catalogos = catalogos;
    }

    @GetMapping("/zonas")
    public List<CatalogoDtos.Zona> zonas() {
        return catalogos.zonas();
    }

    @GetMapping("/especialidades")
    public List<CatalogoDtos.Especialidad> especialidades() {
        return catalogos.especialidades();
    }

    @PostMapping("/zonas")
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaDtos.Id crearZona(@Valid @RequestBody CatalogoDtos.NuevaZona zona) {
        return new CuentaDtos.Id(catalogos.crearZona(zona));
    }

    @PostMapping("/especialidades")
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaDtos.Id crearEspecialidad(@Valid @RequestBody CatalogoDtos.NuevaEspecialidad especialidad) {
        return new CuentaDtos.Id(catalogos.crearEspecialidad(especialidad));
    }
}
