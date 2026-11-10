package co.edu.unbosque.bountyline.service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.MensajeChatDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.MensajeChat;
import co.edu.unbosque.bountyline.model.Mision;
import co.edu.unbosque.bountyline.repository.MensajeChatRepository;
import co.edu.unbosque.bountyline.repository.MisionRepository;

@Service
public class MensajeChatService {

    private static final Set<String> ESCRIBIR = Set.of("ASIGNADA", "EN_CURSO");
    private static final Set<String> LEER = Set.of("ASIGNADA", "EN_CURSO", "CERRADA");

    private final MensajeChatRepository mensajes;
    private final MisionRepository misiones;

    public MensajeChatService(MensajeChatRepository mensajes, MisionRepository misiones) {
        this.mensajes = mensajes;
        this.misiones = misiones;
    }

    public List<MensajeChatDto> listar(Long idMision, Long idCuenta, boolean admin) {
        Mision m = mision(idMision);
        if (!admin) {
            exigirParticipante(m, idCuenta);
            if (!LEER.contains(m.getEstado())) {
                throw new ReglaNegocioException("El chat solo existe cuando la misión tiene un cazarrecompensas asignado.");
            }
        }
        return mensajes.listar(idMision.intValue()).stream().map(MensajeChatService::aDto).toList();
    }

    public MensajeChatDto enviar(Long idMision, Long idCuenta, String alias, String rol, MensajeChatDto.Nuevo n) {
        Mision m = mision(idMision);
        exigirParticipante(m, idCuenta);
        if (!ESCRIBIR.contains(m.getEstado())) {
            throw new ReglaNegocioException("Solo se puede escribir mientras la misión está asignada o en curso.");
        }
        MensajeChat msg = new MensajeChat();
        msg.setIdMision(idMision.intValue());
        msg.setIdEmisor(idCuenta.intValue());
        msg.setAliasEmisor(alias);
        msg.setRolEmisor(rol);
        msg.setTexto(n.texto().trim());
        msg.setFecha(Instant.now());
        msg.setLeido(false);
        return aDto(mensajes.insertar(msg));
    }

    public long marcarLeidos(Long idMision, Long idCuenta) {
        exigirParticipante(mision(idMision), idCuenta);
        return mensajes.marcarLeidos(idMision.intValue(), idCuenta.intValue());
    }

    public long sinLeer(Long idMision, Long idCuenta) {
        exigirParticipante(mision(idMision), idCuenta);
        return mensajes.contarSinLeer(idMision.intValue(), idCuenta.intValue());
    }

    private Mision mision(Long idMision) {
        return misiones.buscarPorId(idMision).orElseThrow(() -> new NoEncontradoException("La misión no existe."));
    }

    private static void exigirParticipante(Mision m, Long idCuenta) {
        if (!idCuenta.equals(m.getIdUsuario()) && !idCuenta.equals(m.getIdCazarrecompensas())) {
            throw new AccessDeniedException("Solo el usuario y el cazarrecompensas de la misión pueden usar este chat.");
        }
    }

    private static MensajeChatDto aDto(MensajeChat m) {
        return new MensajeChatDto(m.getId(), m.getIdMision() == null ? null : m.getIdMision().longValue(),
                m.getIdEmisor() == null ? null : m.getIdEmisor().longValue(), m.getAliasEmisor(), m.getRolEmisor(),
                m.getTexto(), m.getFecha(), Boolean.TRUE.equals(m.getLeido()));
    }
}
