package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;

@Service
public class CuentaService {

    private final CuentaRepository cuentas;
    private final PasswordEncoder encoder;

    public CuentaService(CuentaRepository cuentas, PasswordEncoder encoder) {
        this.cuentas = cuentas;
        this.encoder = encoder;
    }

    public List<CuentaDto> listar(String rol, String estado) {
        return cuentas.listar(rol, estado).stream().map(CuentaDto::desde).toList();
    }

    public CuentaDto buscar(Long idCuenta) {
        return CuentaDto.desde(obtener(idCuenta));
    }

    public CuentaDto cambiarCorreo(Long idCuenta, CuentaDto.CambioCorreo cambio) {
        cuentas.cambiarCorreo(idCuenta, cambio.correo().trim().toLowerCase());
        return buscar(idCuenta);
    }

    /** Comprueba la contraseña actual y guarda el hash BCrypt de la nueva (S11). */
    public void cambiarContrasena(Long idCuenta, CuentaDto.CambioContrasena cambio) {
        Cuenta c = cuentas.buscarPorId(idCuenta)
                .orElseThrow(() -> new NoEncontradoException("La cuenta no existe."));
        if (!encoder.matches(cambio.actual(), c.getContrasenaHash())) {
            throw new ReglaNegocioException("La contraseña actual no es correcta.");
        }
        if (cambio.actual().equals(cambio.nueva())) {
            throw new ReglaNegocioException("La nueva contraseña debe ser distinta de la actual.");
        }
        cuentas.cambiarContrasena(idCuenta, encoder.encode(cambio.nueva()));
    }

    public CuentaDto cambiarEstado(Long idAdministrador, Long idCuenta, CuentaDto.CambioEstado cambio) {
        cuentas.cambiarEstado(idAdministrador, idCuenta, cambio.estado());
        return buscar(idCuenta);
    }

    private Cuenta obtener(Long idCuenta) {
        return cuentas.buscarPorId(idCuenta).orElseThrow(() -> new NoEncontradoException("La cuenta no existe."));
    }

}
