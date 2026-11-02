package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CazarrecompensasDto;
import co.edu.unbosque.bountyline.service.CazarrecompensasService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cazarrecompensas")
public class CazarrecompensasController {

    private final CazarrecompensasService servicio;

    public CazarrecompensasController(CazarrecompensasService servicio) {
        this.servicio = servicio;
    }

    /** Búsqueda manual con filtros (RF-06). */
    @GetMapping
    public List<CazarrecompensasDto> listar(@RequestParam(required = false) Long idZona,
                                            @RequestParam(required = false) String disponibilidad) {
        return servicio.listar(idZona, disponibilidad);
    }

    @GetMapping("/{id}")
    public CazarrecompensasDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PutMapping("/{id}")
    public CazarrecompensasDto actualizar(@PathVariable Long id,
                                          @Valid @RequestBody CazarrecompensasDto.Actualizacion actualizacion) {
        return servicio.actualizar(id, actualizacion);
    }
}
