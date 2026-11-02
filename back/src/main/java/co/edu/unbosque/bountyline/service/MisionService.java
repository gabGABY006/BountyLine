package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
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

    public MisionDto publicar(MisionDto.Nueva nueva) {
        return buscar(misiones.publicar(nueva));
    }

    public List<MisionDto.Sugerencia> sugerencias(Long idMision, int limite) {
        buscar(idMision);
        return misiones.sugerencias(idMision, Math.max(1, Math.min(limite, 50)));
    }

    public MisionDto asignar(Long idMision, MisionDto.Asignacion a) {
        misiones.asignar(idMision, a.idUsuario(), a.idCazarrecompensas());
        return buscar(idMision);
    }

    public MisionDto iniciar(Long idMision, MisionDto.Inicio i) {
        misiones.iniciar(idMision, i.idCazarrecompensas());
        return buscar(idMision);
    }

    public MisionDto cerrar(Long idMision, MisionDto.Cierre c) {
        misiones.cerrar(idMision, c.idUsuario());
        return buscar(idMision);
    }

    public MisionDto cancelar(Long idMision, MisionDto.Cancelacion c) {
        if (c.idUsuario() == null && c.idAdministrador() == null) {
            throw new ReglaNegocioException("Indique el usuario que publicó la misión o el administrador que la cancela.");
        }
        misiones.cancelar(idMision, c.idUsuario(), c.idAdministrador());
        return buscar(idMision);
    }
}
