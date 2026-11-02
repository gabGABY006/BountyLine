package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.AdministradorDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.AdministradorRepository;

@Service
public class AdministradorService {

    private final AdministradorRepository administradores;

    public AdministradorService(AdministradorRepository administradores) {
        this.administradores = administradores;
    }

    public List<AdministradorDto> listar() {
        return administradores.listar();
    }

    public AdministradorDto buscar(Long idAdministrador) {
        return administradores.buscar(idAdministrador)
                .orElseThrow(() -> new NoEncontradoException("El administrador no existe."));
    }
}
