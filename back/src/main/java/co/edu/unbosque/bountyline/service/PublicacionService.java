package co.edu.unbosque.bountyline.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.bson.types.ObjectId;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.ComentarioDto;
import co.edu.unbosque.bountyline.dto.PublicacionDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Comentario;
import co.edu.unbosque.bountyline.model.Publicacion;
import co.edu.unbosque.bountyline.repository.MisionRepository;
import co.edu.unbosque.bountyline.repository.PublicacionRepository;
import co.edu.unbosque.bountyline.repository.ZonaRepository;

@Service
public class PublicacionService {

    private static final String VISIBLE = "VISIBLE";

    private final PublicacionRepository publicaciones;
    private final ZonaRepository zonas;
    private final MisionRepository misiones;
    private final ActividadService actividad;

    public PublicacionService(PublicacionRepository publicaciones, ZonaRepository zonas, MisionRepository misiones,
                              ActividadService actividad) {
        this.publicaciones = publicaciones;
        this.zonas = zonas;
        this.misiones = misiones;
        this.actividad = actividad;
    }

    public List<PublicacionDto> listar(Long idLector, boolean admin, String etiqueta, Long idZona, Long idCuenta,
                                       Long idMision, String texto, int pagina, int tamano) {
        if (pagina < 0) {
            throw new ReglaNegocioException("La página no puede ser negativa.");
        }
        int t = Math.max(1, Math.min(tamano, 50));
        return publicaciones.listar(!admin, vacio(etiqueta) ? null : etiqueta.trim().toLowerCase(), entero(idZona),
                entero(idCuenta), entero(idMision), vacio(texto) ? null : texto.trim(), pagina, t)
                .stream().map(p -> aDto(p, idLector, admin)).toList();
    }

    public PublicacionDto buscar(String id, Long idLector, boolean admin) {
        Publicacion p = obtener(id);
        if (!admin && !VISIBLE.equals(p.getEstadoModeracion())) {
            throw new NoEncontradoException("La publicación no existe.");
        }
        return aDto(p, idLector, admin);
    }

    public PublicacionDto publicar(Long idCuenta, String alias, String rol, PublicacionDto.Nueva n) {
        Publicacion p = new Publicacion();
        p.setIdCuenta(idCuenta.intValue());
        p.setAlias(alias);
        p.setRol(rol);
        p.setTexto(n.texto().trim());
        p.setEtiquetas(etiquetas(n.etiquetas()));
        if (n.idZona() != null) {
            p.setIdZona(n.idZona().intValue());
            p.setZona(zonas.buscarPorId(n.idZona())
                    .orElseThrow(() -> new ReglaNegocioException("La zona no existe.")).getNombre());
        }
        if (n.idMision() != null) {
            misiones.buscarPorId(n.idMision()).orElseThrow(() -> new ReglaNegocioException("La misión no existe."));
            p.setIdMision(n.idMision().intValue());
        }
        p.setReacciones(new Publicacion.Reacciones());
        p.setReaccionaron(new java.util.ArrayList<>());
        p.setComentarios(new java.util.ArrayList<>());
        p.setEstadoModeracion(VISIBLE);
        p.setFechaPublicacion(Instant.now());
        Publicacion guardada = publicaciones.insertar(p);
        actividad.publicacion(idCuenta, rol);
        return aDto(guardada, idCuenta, false);
    }

    public PublicacionDto editar(String id, Long idCuenta, PublicacionDto.Edicion e) {
        Publicacion p = obtener(id);
        if (!Objects.equals(p.getIdCuenta(), idCuenta.intValue())) {
            throw new AccessDeniedException("Solo el autor puede editar la publicación.");
        }
        publicaciones.editar(id, e.texto().trim(), etiquetas(e.etiquetas()));
        return aDto(obtener(id), idCuenta, false);
    }

    public void eliminar(String id, Long idCuenta, boolean admin) {
        Publicacion p = obtener(id);
        if (!admin && !Objects.equals(p.getIdCuenta(), idCuenta.intValue())) {
            throw new AccessDeniedException("Solo el autor o un administrador pueden eliminar la publicación.");
        }
        publicaciones.eliminar(id);
    }

    public PublicacionDto comentar(String id, Long idCuenta, String alias, PublicacionDto.NuevoComentario c) {
        Publicacion p = obtener(id);
        if (!VISIBLE.equals(p.getEstadoModeracion())) {
            throw new ReglaNegocioException("No se puede comentar una publicación oculta.");
        }
        publicaciones.agregarComentario(id, new Comentario(new ObjectId(), idCuenta.intValue(), alias,
                c.texto().trim(), Instant.now(), VISIBLE));
        return aDto(obtener(id), idCuenta, false);
    }

    public PublicacionDto reaccionar(String id, Long idCuenta, String tipo) {
        Publicacion p = obtener(id);
        if (!VISIBLE.equals(p.getEstadoModeracion())) {
            throw new ReglaNegocioException("No se puede reaccionar a una publicación oculta.");
        }
        Integer cuenta = idCuenta.intValue();
        String anterior = miReaccion(p, cuenta);
        if (anterior != null) {
            publicaciones.quitarReaccion(id, cuenta, anterior);
        }
        if (!tipo.equals(anterior)) {
            publicaciones.agregarReaccion(id, cuenta, tipo);
        }
        return aDto(obtener(id), idCuenta, false);
    }

    public PublicacionDto moderar(String id, String estado) {
        if (!"VISIBLE".equals(estado) && !"OCULTA".equals(estado)) {
            throw new ReglaNegocioException("Una publicación solo puede quedar VISIBLE u OCULTA.");
        }
        obtener(id);
        publicaciones.moderar(id, estado);
        return aDto(obtener(id), null, true);
    }

    public void moderarComentario(String idComentario, String estado) {
        if (!"VISIBLE".equals(estado) && !"OCULTO".equals(estado)) {
            throw new ReglaNegocioException("Un comentario solo puede quedar VISIBLE u OCULTO.");
        }
        if (!ObjectId.isValid(idComentario) || !publicaciones.moderarComentario(idComentario, estado)) {
            throw new NoEncontradoException("El comentario no existe.");
        }
    }

    private Publicacion obtener(String id) {
        return publicaciones.buscar(id).orElseThrow(() -> new NoEncontradoException("La publicación no existe."));
    }

    private static PublicacionDto aDto(Publicacion p, Long idLector, boolean admin) {
        Publicacion.Reacciones r = p.getReacciones() == null ? new Publicacion.Reacciones() : p.getReacciones();
        List<ComentarioDto> comentarios = p.getComentarios() == null ? List.of() : p.getComentarios().stream()
                .filter(c -> admin || VISIBLE.equals(c.getEstadoModeracion()))
                .map(c -> new ComentarioDto(c.getId() == null ? null : c.getId().toHexString(), largo(c.getIdCuenta()),
                        c.getAlias(), c.getTexto(), c.getFecha(), c.getEstadoModeracion()))
                .toList();
        String mia = idLector == null ? null : miReaccion(p, idLector.intValue());
        return new PublicacionDto(p.getId(), largo(p.getIdCuenta()), p.getAlias(), p.getRol(), p.getTexto(),
                p.getEtiquetas() == null ? List.of() : p.getEtiquetas(), largo(p.getIdZona()), p.getZona(),
                largo(p.getIdMision()), new PublicacionDto.Reacciones(n(r.getMeGusta()), n(r.getFuego()), n(r.getAlerta())),
                mia, comentarios, p.getEstadoModeracion(), p.getFechaPublicacion(), p.getFechaEdicion());
    }

    private static String miReaccion(Publicacion p, Integer idCuenta) {
        if (p.getReaccionaron() == null) {
            return null;
        }
        return p.getReaccionaron().stream().filter(x -> idCuenta.equals(x.getIdCuenta()))
                .map(Publicacion.Reaccion::getTipo).findFirst().orElse(null);
    }

    private static List<String> etiquetas(List<String> lista) {
        return lista == null ? List.of() : lista.stream().map(String::toLowerCase).distinct().toList();
    }

    private static boolean vacio(String s) {
        return s == null || s.isBlank();
    }

    private static Integer entero(Long v) {
        return v == null ? null : v.intValue();
    }

    private static Long largo(Integer v) {
        return v == null ? null : v.longValue();
    }

    private static int n(Integer v) {
        return v == null ? 0 : v;
    }
}
