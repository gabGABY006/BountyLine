package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.ReporteDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.ReporteRepository;

@Service
public class ReporteService {

    private final ReporteRepository reportes;

    public ReporteService(ReporteRepository reportes) {
        this.reportes = reportes;
    }

    public List<ReporteDto> listar(String estado) {
        return reportes.listar(estado);
    }

    public ReporteDto buscar(Long idReporte) {
        return reportes.buscar(idReporte).orElseThrow(() -> new NoEncontradoException("El reporte no existe."));
    }

    public ReporteDto crear(Long idCuentaReporta, ReporteDto.Nuevo nuevo) {
        return buscar(reportes.crear(idCuentaReporta, nuevo));
    }

    public ReporteDto resolver(Long idAdministrador, Long idReporte, ReporteDto.Resolucion r) {
        reportes.resolver(idReporte, idAdministrador, r.estado(), Boolean.TRUE.equals(r.suspender()));
        return buscar(idReporte);
    }
}
