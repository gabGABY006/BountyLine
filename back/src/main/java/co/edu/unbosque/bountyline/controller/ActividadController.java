package co.edu.unbosque.bountyline.controller;

import java.time.LocalDate;
import java.util.List;

import org.bson.Document;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.EventoActividadDto;
import co.edu.unbosque.bountyline.service.ActividadService;
import co.edu.unbosque.bountyline.service.EstadisticaSocialService;

/** Bitácora de actividad y reportes de MongoDB. Solo para administradores. */
@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ActividadController {

    private final ActividadService actividad;
    private final EstadisticaSocialService estadisticas;

    public ActividadController(ActividadService actividad, EstadisticaSocialService estadisticas) {
        this.actividad = actividad;
        this.estadisticas = estadisticas;
    }

    @GetMapping("/bitacora-actividad")
    public List<EventoActividadDto> listar(@RequestParam(required = false) String tipo,
                                           @RequestParam(required = false) Long idCuenta,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                           @RequestParam(defaultValue = "100") int limite) {
        return actividad.listar(tipo, idCuenta, desde, hasta, limite);
    }

    @GetMapping("/estadisticas-sociales/etiquetas-por-zona")
    public List<Document> etiquetasPorZona(@RequestParam(defaultValue = "5") int top) {
        return estadisticas.etiquetasPorZona(top);
    }

    @GetMapping("/estadisticas-sociales/publicaciones-por-semana")
    public List<Document> publicacionesPorSemana() {
        return estadisticas.publicacionesPorSemana();
    }

    @GetMapping("/estadisticas-sociales/mensajes-por-mision")
    public Document mensajesPorMision() {
        return estadisticas.mensajesPorMision();
    }

    @GetMapping("/estadisticas-sociales/filtros-mas-usados")
    public List<Document> filtrosMasUsados() {
        return estadisticas.filtrosMasUsados();
    }
}
