package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.UsuarioDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;

    public UsuarioService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    public List<UsuarioDto> listar() {
        return usuarios.listarDetalle();
    }

    public UsuarioDto buscar(Long idUsuario) {
        return usuarios.buscarDetalle(idUsuario).orElseThrow(() -> new NoEncontradoException("El usuario no existe."));
    }

    public UsuarioDto actualizar(Long idUsuario, UsuarioDto.Actualizacion a) {
        usuarios.actualizar(idUsuario, a.biografia());
        return buscar(idUsuario);
    }
}
