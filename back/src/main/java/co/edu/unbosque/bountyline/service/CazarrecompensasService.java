package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CazarrecompensasDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.CazarrecompensasRepository;

@Service
public class CazarrecompensasService {

    private final CazarrecompensasRepository cazarrecompensas;

    public CazarrecompensasService(CazarrecompensasRepository cazarrecompensas) {
        this.cazarrecompensas = cazarrecompensas;
    }

    public List<CazarrecompensasDto> listar(String alias, Long idZona, Long idEspecialidad, String disponibilidad) {
        return cazarrecompensas.listarPerfiles(alias, idZona, idEspecialidad, disponibilidad);
    }

    public CazarrecompensasDto.Resumen resumen(Long idCazarrecompensas) {
        buscar(idCazarrecompensas);
        return cazarrecompensas.resumen(idCazarrecompensas);
    }

    public CazarrecompensasDto buscar(Long idCazarrecompensas) {
        return cazarrecompensas.buscarPerfil(idCazarrecompensas)
                .orElseThrow(() -> new NoEncontradoException("El cazarrecompensas no existe."));
    }

    public CazarrecompensasDto actualizar(Long idCazarrecompensas, CazarrecompensasDto.Actualizacion a) {
        cazarrecompensas.actualizar(idCazarrecompensas, a.idZona(), a.biografia(), a.disponibilidad());
        return buscar(idCazarrecompensas);
    }
}
