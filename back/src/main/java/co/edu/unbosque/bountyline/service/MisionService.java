package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.MisionRepository;

@Service
public class MisionService {

    private final MisionRepository misiones;

    public MisionService(MisionRepository misiones) {
        this.misiones = misiones;
    }

    public List<MisionDto> listar(MisionDto.Filtro filtro) {
        return misiones.listarDetalle(filtro);
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

    public MisionDto asignar(Long idUsuario, Long idMision, MisionDto.Asignacion a) {
        misiones.asignar(idMision, idUsuario, a.idCazarrecompensas());
        return buscar(idMision);
    }

    public MisionDto iniciar(Long idCazarrecompensas, Long idMision) {
        misiones.iniciar(idMision, idCazarrecompensas);
        return buscar(idMision);
    }

    public MisionDto cerrar(Long idUsuario, Long idMision) {
        misiones.cerrar(idMision, idUsuario);
        return buscar(idMision);
    }

    public MisionDto cancelar(Long idCuenta, boolean esAdministrador, Long idMision) {
        if (esAdministrador) {
            misiones.cancelar(idMision, null, idCuenta);
        } else {
            misiones.cancelar(idMision, idCuenta, null);
        }
        return buscar(idMision);
    }
}
