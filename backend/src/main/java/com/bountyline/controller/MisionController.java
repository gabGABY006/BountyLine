package com.bountyline.controller;

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

import com.bountyline.dto.MisionDtos;
import com.bountyline.exception.NoEncontradoException;
import com.bountyline.exception.ReglaNegocioException;
import com.bountyline.repository.MisionRepository;

import jakarta.validation.Valid;

/**
 * Ciclo de vida de una misión. Cada acción llama a su procedimiento
 * almacenado, que valida las reglas y maneja la transacción.
 */
@RestController
@RequestMapping("/api/misiones")
public class MisionController {

    private final MisionRepository misiones;

    public MisionController(MisionRepository misiones) {
        this.misiones = misiones;
    }

    @GetMapping
    public List<MisionDtos.Mision> listar(@RequestParam(required = false) String estado,
                                          @RequestParam(required = false) Long idUsuario,
                                          @RequestParam(required = false) Long idCazarrecompensas) {
        return misiones.listar(estado, idUsuario, idCazarrecompensas);
    }

    @GetMapping("/{id}")
    public MisionDtos.Mision ver(@PathVariable Long id) {
        return misiones.buscar(id).orElseThrow(() -> new NoEncontradoException("La misión no existe."));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MisionDtos.Mision publicar(@Valid @RequestBody MisionDtos.NuevaMision nueva) {
        Long id = misiones.publicar(nueva);
        return ver(id);
    }

    @GetMapping("/{id}/postulaciones")
    public List<MisionDtos.Postulacion> postulaciones(@PathVariable Long id) {
        return misiones.postulaciones(id);
    }

    @PostMapping("/{id}/postulaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public List<MisionDtos.Postulacion> postular(@PathVariable Long id,
                                                 @Valid @RequestBody MisionDtos.NuevaPostulacion p) {
        misiones.postular(id, p.idCazarrecompensas(), p.mensaje());
        return misiones.postulaciones(id);
    }

    @GetMapping("/{id}/sugerencias")
    public List<MisionDtos.Sugerencia> sugerencias(@PathVariable Long id,
                                                   @RequestParam(defaultValue = "5") int limite) {
        return misiones.sugerencias(id, limite);
    }

    @PostMapping("/{id}/asignacion")
    public MisionDtos.Mision asignar(@PathVariable Long id, @Valid @RequestBody MisionDtos.Asignacion a) {
        misiones.asignar(id, a.idUsuario(), a.idCazarrecompensas());
        return ver(id);
    }

    @PostMapping("/{id}/inicio")
    public MisionDtos.Mision iniciar(@PathVariable Long id, @Valid @RequestBody MisionDtos.Inicio i) {
        misiones.iniciar(id, i.idCazarrecompensas());
        return ver(id);
    }

    @PostMapping("/{id}/cierre")
    public MisionDtos.Mision cerrar(@PathVariable Long id, @Valid @RequestBody MisionDtos.Cierre c) {
        misiones.cerrar(id, c.idUsuario());
        return ver(id);
    }

    @PostMapping("/{id}/cancelacion")
    public MisionDtos.Mision cancelar(@PathVariable Long id, @RequestBody MisionDtos.Cancelacion c) {
        if (c.idUsuario() == null && c.idAdministrador() == null) {
            throw new ReglaNegocioException("Indique el usuario que publicó la misión o el administrador que la cancela.");
        }
        misiones.cancelar(id, c.idUsuario(), c.idAdministrador());
        return ver(id);
    }

    @PostMapping("/{id}/calificacion")
    public MisionDtos.Mision calificar(@PathVariable Long id, @Valid @RequestBody MisionDtos.Calificacion c) {
        misiones.calificar(id, c.idUsuario(), c.puntaje(), c.comentario());
        return ver(id);
    }
}
