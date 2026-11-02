package co.edu.unbosque.bountyline.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.service.MisionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/misiones")
public class MisionController {

    private final MisionService servicio;

    public MisionController(MisionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<MisionDto> listar(@RequestParam(required = false) String estado,
                                  @RequestParam(required = false) Long idUsuario,
                                  @RequestParam(required = false) Long idCazarrecompensas) {
        return servicio.listar(estado, idUsuario, idCazarrecompensas);
    }

    @GetMapping("/{id}")
    public MisionDto buscar(@PathVariable Long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MisionDto publicar(@Valid @RequestBody MisionDto.Nueva nueva) {
        return servicio.publicar(nueva);
    }

    @GetMapping("/{id}/sugerencias")
    public List<MisionDto.Sugerencia> sugerencias(@PathVariable Long id, @RequestParam(defaultValue = "5") int limite) {
        return servicio.sugerencias(id, limite);
    }

    @PostMapping("/{id}/asignacion")
    public MisionDto asignar(@PathVariable Long id, @Valid @RequestBody MisionDto.Asignacion a) {
        return servicio.asignar(id, a);
    }

    @PostMapping("/{id}/inicio")
    public MisionDto iniciar(@PathVariable Long id, @Valid @RequestBody MisionDto.Inicio i) {
        return servicio.iniciar(id, i);
    }

    @PostMapping("/{id}/cierre")
    public MisionDto cerrar(@PathVariable Long id, @Valid @RequestBody MisionDto.Cierre c) {
        return servicio.cerrar(id, c);
    }

    @PostMapping("/{id}/cancelacion")
    public MisionDto cancelar(@PathVariable Long id, @RequestBody MisionDto.Cancelacion c) {
        return servicio.cancelar(id, c);
    }
}
