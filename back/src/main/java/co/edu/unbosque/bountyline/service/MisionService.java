package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.MisionRepository;

/**
 * Ciclo de vida de una misión. Cada acción llama a su procedimiento
 * almacenado, que valida las reglas y maneja la transacción.
 */
@Service
public class MisionService {

    private final MisionRepository misiones;

    public MisionService(MisionRepository misiones) {
        this.misiones = misiones;
    }

    public List<MisionDto> listar(String estado, Long idUsuario, Long idCazarrecompensas) {
        return misiones.listarDetalle(estado, idUsuario, idCazarrecompensas);
    }

    public MisionDto buscar(Long idMision) {
        return misiones.buscarDetalle(idMision).orElseThrow(() -> new NoEncontradoException("La misión no existe."));
    }

    public MisionDto publicar(Long idUsuario, MisionDto.Nueva nueva) {
        return buscar(misiones.publicar(idUsuario, nueva));
    }

    public List<MisionDto.Sugerencia> sugerencias(Long idMision, int limite) {
        buscar(idMision);
        return misiones.sugerencias(idMision, Math.max(1, Math.min(limite, 50)));
    }

    /** El usuario que publicó la misión elige a un postulado. */
    public MisionDto asignar(Long idUsuario, Long idMision, MisionDto.Asignacion a) {
        misiones.asignar(idMision, idUsuario, a.idCazarrecompensas());
        return buscar(idMision);
    }

    /** El cazarrecompensas asignado inicia la misión. */
    public MisionDto iniciar(Long idCazarrecompensas, Long idMision) {
        misiones.iniciar(idMision, idCazarrecompensas);
        return buscar(idMision);
    }

    /** El usuario que publicó la misión la cierra y se libera el pago. */
    public MisionDto cerrar(Long idUsuario, Long idMision) {
        misiones.cerrar(idMision, idUsuario);
        return buscar(idMision);
    }

    /** La cancela el usuario que la publicó o un administrador; el monto retenido se devuelve. */
    public MisionDto cancelar(Long idCuenta, boolean esAdministrador, Long idMision) {
        if (esAdministrador) {
            misiones.cancelar(idMision, null, idCuenta);
        } else {
            misiones.cancelar(idMision, idCuenta, null);
        }
        return buscar(idMision);
    }
}
