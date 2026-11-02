package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.ZonaDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.ZonaRepository;

@Service
public class ZonaService {

    private final ZonaRepository zonas;

    public ZonaService(ZonaRepository zonas) {
        this.zonas = zonas;
    }

    public List<ZonaDto> listar() {
        return zonas.listar().stream().map(ZonaDto::desde).toList();
    }

    public ZonaDto buscar(Long idZona) {
        return zonas.buscarPorId(idZona).map(ZonaDto::desde)
                .orElseThrow(() -> new NoEncontradoException("La zona no existe."));
    }

    public ZonaDto crear(Long idAdministrador, ZonaDto.Guardar z) {
        Long id = zonas.crear(idAdministrador, z.nombre().trim(), z.descripcion(), z.nivelPeligro());
        return buscar(id);
    }

    public ZonaDto actualizar(Long idAdministrador, Long idZona, ZonaDto.Guardar z) {
        zonas.actualizar(idAdministrador, idZona, z.nombre().trim(), z.descripcion(), z.nivelPeligro());
        return buscar(idZona);
    }
}
