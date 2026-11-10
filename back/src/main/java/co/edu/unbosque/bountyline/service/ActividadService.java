package co.edu.unbosque.bountyline.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.EventoActividadDto;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.EventoActividad;
import co.edu.unbosque.bountyline.repository.EventoActividadRepository;

/**
 * Bitácora de actividad en MongoDB (S84). Registrar un evento nunca hace
 * fallar la petición: si MongoDB no responde, solo queda un aviso en el log.
 */
@Service
public class ActividadService {

    private static final Logger LOG = LoggerFactory.getLogger(ActividadService.class);
    private static final Set<String> TIPOS =
            Set.of("INICIO_SESION", "CIERRE_SESION", "BUSQUEDA", "VISTA_MISION", "VISTA_PERFIL", "PUBLICACION");
    private static final ZoneId ZONA = ZoneId.of("America/Bogota");

    private final EventoActividadRepository eventos;

    public ActividadService(EventoActividadRepository eventos) {
        this.eventos = eventos;
    }

    public void inicioSesion(Long idCuenta, String rol, boolean exito) {
        EventoActividad e = nuevo("INICIO_SESION", idCuenta, rol);
        e.setExito(exito);
        guardar(e);
    }

    /** Búsqueda con los filtros que se usaron (solo los que traen valor). */
    public void busqueda(Long idCuenta, String rol, String pantalla, Map<String, Object> filtros, int resultados) {
        EventoActividad e = nuevo("BUSQUEDA", idCuenta, rol);
        e.setPantalla(pantalla);
        Map<String, Object> usados = new LinkedHashMap<>();
        filtros.forEach((k, v) -> {
            if (v instanceof Long l) {
                usados.put(k, l.intValue());
            } else if (v != null && !(v instanceof String s && s.isBlank())) {
                usados.put(k, v);
            }
        });
        e.setFiltros(usados);
        e.setResultados(resultados);
        guardar(e);
    }

    public void vistaMision(Long idCuenta, String rol, Long idMision) {
        EventoActividad e = nuevo("VISTA_MISION", idCuenta, rol);
        e.setIdMision(idMision.intValue());
        guardar(e);
    }

    public void vistaPerfil(Long idCuenta, String rol, Long idCuentaVista) {
        EventoActividad e = nuevo("VISTA_PERFIL", idCuenta, rol);
        e.setIdCuentaVista(idCuentaVista.intValue());
        guardar(e);
    }

    public void publicacion(Long idCuenta, String rol) {
        guardar(nuevo("PUBLICACION", idCuenta, rol));
    }

    public List<EventoActividadDto> listar(String tipo, Long idCuenta, LocalDate desde, LocalDate hasta, int limite) {
        if (tipo != null && !tipo.isBlank() && !TIPOS.contains(tipo)) {
            throw new ReglaNegocioException("Tipo de evento no válido.");
        }
        if (desde != null && hasta != null && hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha final no puede ser anterior a la inicial.");
        }
        Instant ini = desde == null ? null : desde.atStartOfDay(ZONA).toInstant();
        Instant fin = hasta == null ? null : hasta.plusDays(1).atStartOfDay(ZONA).toInstant();
        return eventos.listar(tipo, idCuenta == null ? null : idCuenta.intValue(), ini, fin,
                Math.max(1, Math.min(limite, 500))).stream().map(ActividadService::aDto).toList();
    }

    private static EventoActividad nuevo(String tipo, Long idCuenta, String rol) {
        EventoActividad e = new EventoActividad();
        e.setTipo(tipo);
        e.setIdCuenta(idCuenta.intValue());
        e.setRol(rol);
        e.setFecha(Instant.now());
        return e;
    }

    private void guardar(EventoActividad e) {
        try {
            eventos.insertar(e);
        } catch (RuntimeException ex) {
            LOG.warn("No se pudo registrar el evento {} en MongoDB: {}", e.getTipo(), ex.getMessage());
        }
    }

    private static EventoActividadDto aDto(EventoActividad e) {
        return new EventoActividadDto(e.getId(), e.getTipo(), largo(e.getIdCuenta()), e.getRol(), e.getFecha(),
                e.getExito(), e.getPantalla(), e.getFiltros(), e.getResultados(), largo(e.getIdMision()),
                largo(e.getIdCuentaVista()));
    }

    private static Long largo(Integer v) {
        return v == null ? null : v.longValue();
    }
}
