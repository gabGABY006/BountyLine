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

    /** Registra un Usuario o un Cazarrecompensas con su perfil y billetera (S30, S37). */
    public CuentaDto.Sesion registrar(CuentaDto.Registro r) {
        String especialidades = null;
        Long idZona = null;
        if ("CAZARRECOMPENSAS".equals(r.rol())) {
            if (r.idZona() == null || r.especialidades() == null || r.especialidades().isEmpty()) {
                throw new ReglaNegocioException("El cazarrecompensas necesita una zona base y al menos una especialidad.");
            }
            idZona = r.idZona();
            especialidades = aJson(r.especialidades());
        }
        String alias = r.alias().trim();
        Long id = cuentas.registrar(r.correo().trim().toLowerCase(), alias, encoder.encode(r.contrasena()), r.rol(),
                r.biografia(), idZona, especialidades);
        return new CuentaDto.Sesion(id, alias, r.rol());
    }

    /** Inicio de sesión básico con correo y contraseña (S16). */
    public CuentaDto.Sesion iniciarSesion(CuentaDto.Login login) {
        Cuenta c = cuentas.buscarPorCorreo(login.correo().trim().toLowerCase())
                .orElseThrow(() -> new ReglaNegocioException("Correo o contraseña incorrectos."));
        if (!encoder.matches(login.contrasena(), c.getContrasenaHash())) {
            throw new ReglaNegocioException("Correo o contraseña incorrectos.");
        }
        if ("SUSPENDIDA".equals(c.getEstado())) {
            throw new ReglaNegocioException("La cuenta está suspendida.");
        }
        return new CuentaDto.Sesion(c.getIdCuenta(), c.getAlias(), c.getRol());
    }

    public CuentaDto cambiarCorreo(Long idCuenta, CuentaDto.CambioCorreo cambio) {
        cuentas.cambiarCorreo(idCuenta, cambio.correo().trim().toLowerCase());
        return buscar(idCuenta);
    }

    public CuentaDto cambiarEstado(Long idCuenta, CuentaDto.CambioEstado cambio) {
        cuentas.cambiarEstado(cambio.idAdministrador(), idCuenta, cambio.estado());
        return buscar(idCuenta);
    }

    private Cuenta obtener(Long idCuenta) {
        return cuentas.buscarPorId(idCuenta).orElseThrow(() -> new NoEncontradoException("La cuenta no existe."));
    }

    /** Arreglo JSON que recibe sp_registrar_cuenta: [{"id":1,"nivel":4}, ...] */
    private static String aJson(List<CuentaDto.EspecialidadNivel> lista) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            CuentaDto.EspecialidadNivel e = lista.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append("{\"id\":").append(e.id()).append(",\"nivel\":").append(e.nivel()).append('}');
        }
        return sb.append(']').toString();
    }
}
