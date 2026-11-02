package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.CazarrecompensasEspecialidadDto;
import co.edu.unbosque.bountyline.service.CazarrecompensasEspecialidadService;
import jakarta.validation.Valid;

/** Especialidades de un cazarrecompensas con su nivel. */
@RestController
@RequestMapping("/api/cazarrecompensas/{idCazarrecompensas}/especialidades")
public class CazarrecompensasEspecialidadController {

    private final CazarrecompensasEspecialidadService servicio;

    public CazarrecompensasEspecialidadController(CazarrecompensasEspecialidadService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<CazarrecompensasEspecialidadDto> listar(@PathVariable Long idCazarrecompensas) {
        return servicio.listar(idCazarrecompensas);
    }

    /** Agrega la especialidad o cambia su nivel. */
    @PostMapping
    public List<CazarrecompensasEspecialidadDto> guardar(@PathVariable Long idCazarrecompensas,
                                                         @Valid @RequestBody CazarrecompensasEspecialidadDto.Guardar g) {
        return servicio.guardar(idCazarrecompensas, g);
    }

    @DeleteMapping("/{idEspecialidad}")
    public List<CazarrecompensasEspecialidadDto> quitar(@PathVariable Long idCazarrecompensas,
                                                        @PathVariable Long idEspecialidad) {
        return servicio.quitar(idCazarrecompensas, idEspecialidad);
    }
}
