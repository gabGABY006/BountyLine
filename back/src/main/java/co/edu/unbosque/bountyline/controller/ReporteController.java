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

import co.edu.unbosque.bountyline.dto.CuentaDtos;
import co.edu.unbosque.bountyline.dto.ReporteDtos;
import co.edu.unbosque.bountyline.repository.ReporteRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteRepository reportes;

    public ReporteController(ReporteRepository reportes) {
        this.reportes = reportes;
    }

    @GetMapping
    public List<ReporteDtos.Reporte> listar(@RequestParam(required = false) String estado) {
        return reportes.listar(estado);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaDtos.Id crear(@Valid @RequestBody ReporteDtos.NuevoReporte reporte) {
        return new CuentaDtos.Id(reportes.crear(reporte));
    }

    @PostMapping("/{id}/resolucion")
    public List<ReporteDtos.Reporte> resolver(@PathVariable Long id,
                                              @Valid @RequestBody ReporteDtos.Resolucion resolucion) {
        reportes.resolver(id, resolucion);
        return reportes.listar(null);
    }
}
