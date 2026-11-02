package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.EspecialidadDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.EspecialidadRepository;

@Service
public class EspecialidadService {

    private final EspecialidadRepository especialidades;

    public EspecialidadService(EspecialidadRepository especialidades) {
        this.especialidades = especialidades;
    }

    public List<EspecialidadDto> listar() {
        return especialidades.listar().stream().map(EspecialidadDto::desde).toList();
    }

    public EspecialidadDto buscar(Long idEspecialidad) {
        return especialidades.buscarPorId(idEspecialidad).map(EspecialidadDto::desde)
                .orElseThrow(() -> new NoEncontradoException("La especialidad no existe."));
    }

    public EspecialidadDto crear(EspecialidadDto.Guardar e) {
        Long id = especialidades.crear(e.idAdministrador(), e.nombre().trim(), e.descripcion());
        return buscar(id);
    }

    public EspecialidadDto actualizar(Long idEspecialidad, EspecialidadDto.Guardar e) {
        especialidades.actualizar(e.idAdministrador(), idEspecialidad, e.nombre().trim(), e.descripcion());
        return buscar(idEspecialidad);
    }
}
