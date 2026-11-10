package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.ReporteDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.repository.PublicacionRepository;
import co.edu.unbosque.bountyline.repository.ReporteRepository;

@Service
public class ReporteService {

    private static final Logger LOG = LoggerFactory.getLogger(ReporteService.class);

    private final ReporteRepository reportes;
    private final PublicacionRepository publicaciones;

    public ReporteService(ReporteRepository reportes, PublicacionRepository publicaciones) {
        this.reportes = reportes;
        this.publicaciones = publicaciones;
    }

    public List<ReporteDto> listar(String estado) {
        return reportes.listar(estado);
    }

    public ReporteDto buscar(Long idReporte) {
        return reportes.buscar(idReporte).orElseThrow(() -> new NoEncontradoException("El reporte no existe."));
    }

    public ReporteDto crear(Long idCuentaReporta, ReporteDto.Nuevo nuevo) {
        String contenido = nuevo.idContenido();
        if (contenido != null && !contenido.isBlank()
                && publicaciones.buscar(contenido).isEmpty() && !publicaciones.existeComentario(contenido)) {
            throw new ReglaNegocioException("La publicación o el comentario reportado no existe.");
        }
        return buscar(reportes.crear(idCuentaReporta, nuevo));
    }

    public ReporteDto resolver(Long idAdministrador, Long idReporte, ReporteDto.Resolucion r) {
        reportes.resolver(idReporte, idAdministrador, r.estado(), Boolean.TRUE.equals(r.suspender()));
        ReporteDto reporte = buscar(idReporte);
        if ("RESUELTO".equals(reporte.estado()) && reporte.idContenido() != null) {
            ocultar(reporte.idContenido());
        }
        return reporte;
    }

    private void ocultar(String idContenido) {
        try {
            if (publicaciones.buscar(idContenido).isPresent()) {
                publicaciones.moderar(idContenido, "OCULTA");
            } else if (!publicaciones.moderarComentario(idContenido, "OCULTO")) {
                LOG.warn("El contenido reportado {} ya no existe en MongoDB.", idContenido);
            }
        } catch (RuntimeException ex) {
            LOG.warn("No se pudo ocultar el contenido {} en MongoDB: {}", idContenido, ex.getMessage());
        }
    }
}
