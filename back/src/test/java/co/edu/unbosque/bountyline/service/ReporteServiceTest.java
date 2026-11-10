package co.edu.unbosque.bountyline.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import co.edu.unbosque.bountyline.dto.ReporteDto;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Publicacion;
import co.edu.unbosque.bountyline.repository.PublicacionRepository;
import co.edu.unbosque.bountyline.repository.ReporteRepository;

class ReporteServiceTest {

    private static final String PUBLICACION = "665f1c2a9b3e4d0012ab34cd";
    private static final String COMENTARIO = "665f1c2a9b3e4d0012ab34d1";

    private ReporteRepository reportes;
    private PublicacionRepository publicaciones;
    private ReporteService servicio;

    @BeforeEach
    void preparar() {
        reportes = mock(ReporteRepository.class);
        publicaciones = mock(PublicacionRepository.class);
        servicio = new ReporteService(reportes, publicaciones);
    }

    private void reporte(String estado, String idContenido) {
        when(reportes.buscar(5L)).thenReturn(Optional.of(new ReporteDto(5L, 3L, "AXIOM", null, null, idContenido, 1L,
                "Spam", estado, LocalDateTime.now(), LocalDateTime.now())));
    }

    @Test
    void noSeReportaContenidoQueNoExiste() {
        when(publicaciones.buscar(anyString())).thenReturn(Optional.empty());
        when(publicaciones.existeComentario(anyString())).thenReturn(false);
        assertThrows(ReglaNegocioException.class,
                () -> servicio.crear(3L, new ReporteDto.Nuevo(null, "665f1c2a9b3e4d0012ab3400", "Spam")));
        verify(reportes, never()).crear(anyLong(), any());
    }

    @Test
    void resolverOcultaLaPublicacion() {
        reporte("RESUELTO", PUBLICACION);
        when(publicaciones.buscar(PUBLICACION)).thenReturn(Optional.of(new Publicacion()));
        servicio.resolver(1L, 5L, new ReporteDto.Resolucion("RESUELTO", false));
        verify(publicaciones).moderar(PUBLICACION, "OCULTA");
    }

    @Test
    void resolverOcultaElComentario() {
        reporte("RESUELTO", COMENTARIO);
        when(publicaciones.buscar(COMENTARIO)).thenReturn(Optional.empty());
        when(publicaciones.moderarComentario(COMENTARIO, "OCULTO")).thenReturn(true);
        servicio.resolver(1L, 5L, new ReporteDto.Resolucion("RESUELTO", false));
        verify(publicaciones).moderarComentario(COMENTARIO, "OCULTO");
    }

    @Test
    void descartarNoOcultaNada() {
        reporte("DESCARTADO", PUBLICACION);
        servicio.resolver(1L, 5L, new ReporteDto.Resolucion("DESCARTADO", false));
        verify(publicaciones, never()).moderar(anyString(), anyString());
        verify(reportes).resolver(5L, 1L, "DESCARTADO", false);
    }
}
