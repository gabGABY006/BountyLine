package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;

@Service
public class CuentaService {

    private final CuentaRepository cuentas;
    public CuentaService(CuentaRepository cuentas) {
        this.cuentas = cuentas;
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

    public CuentaDto cambiarEstado(Long idAdministrador, Long idCuenta, CuentaDto.CambioEstado cambio) {
        cuentas.cambiarEstado(idAdministrador, idCuenta, cambio.estado());
        return buscar(idCuenta);
    }

    private Cuenta obtener(Long idCuenta) {
        return cuentas.buscarPorId(idCuenta).orElseThrow(() -> new NoEncontradoException("La cuenta no existe."));
    }

}
