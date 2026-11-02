package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CazarrecompensasEspecialidadDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.CazarrecompensasEspecialidadRepository;
import co.edu.unbosque.bountyline.repository.CazarrecompensasRepository;

@Service
public class CazarrecompensasEspecialidadService {

    private final CazarrecompensasEspecialidadRepository especialidades;
    private final CazarrecompensasRepository cazarrecompensas;

    public CazarrecompensasEspecialidadService(CazarrecompensasEspecialidadRepository especialidades,
                                               CazarrecompensasRepository cazarrecompensas) {
        this.especialidades = especialidades;
        this.cazarrecompensas = cazarrecompensas;
    }

    public List<CazarrecompensasEspecialidadDto> listar(Long idCazarrecompensas) {
        if (cazarrecompensas.buscarPorId(idCazarrecompensas).isEmpty()) {
            throw new NoEncontradoException("El cazarrecompensas no existe.");
        }
        return especialidades.listarPorCazarrecompensas(idCazarrecompensas);
    }

    public List<CazarrecompensasEspecialidadDto> guardar(Long idCazarrecompensas,
                                                         CazarrecompensasEspecialidadDto.Guardar g) {
        especialidades.guardar(idCazarrecompensas, g.idEspecialidad(), g.nivel());
        return listar(idCazarrecompensas);
    }

    public List<CazarrecompensasEspecialidadDto> quitar(Long idCazarrecompensas, Long idEspecialidad) {
        especialidades.quitar(idCazarrecompensas, idEspecialidad);
        return listar(idCazarrecompensas);
    }
}
