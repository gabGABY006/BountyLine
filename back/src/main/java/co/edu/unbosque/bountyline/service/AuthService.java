package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.AuthDto;
import co.edu.unbosque.bountyline.exception.NoAutorizadoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;
import co.edu.unbosque.bountyline.security.TokenService;

/** Registro e inicio de sesión. Ambos devuelven un token JWT. */
@Service
public class AuthService {

    private static final int NIVEL_INICIAL = 1;

    private final CuentaRepository cuentas;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final ActividadService actividad;

    public AuthService(CuentaRepository cuentas, PasswordEncoder encoder, TokenService tokens,
                       ActividadService actividad) {
        this.cuentas = cuentas;
        this.encoder = encoder;
        this.tokens = tokens;
        this.actividad = actividad;
    }

    /** Registra un Usuario o un Cazarrecompensas con su perfil y billetera (S30, S37). */
    public AuthDto.Sesion registrar(AuthDto.Registro r) {
        String especialidades = null;
        Long idZona = null;
        if ("CAZARRECOMPENSAS".equals(r.rol())) {
            if (r.idZona() == null || r.especialidades() == null || r.especialidades().isEmpty()) {
                throw new ReglaNegocioException("El cazarrecompensas necesita una zona base y al menos una especialidad.");
            }
            idZona = r.idZona();
            especialidades = aJson(r.especialidades());
        }
        String biografia = r.biografia() == null || r.biografia().isBlank() ? null : r.biografia().trim();
        Long id = cuentas.registrar(r.correo().trim().toLowerCase(), r.alias().trim(), encoder.encode(r.contrasena()),
                r.rol(), biografia, idZona, especialidades);
        return sesion(cuentas.buscarPorId(id).orElseThrow());
    }

    /** Inicio de sesión con correo y contraseña (S16). Cada intento queda en la bitácora de actividad. */
    public AuthDto.Sesion iniciarSesion(AuthDto.Login login) {
        Cuenta c = cuentas.buscarPorCorreo(login.correo().trim().toLowerCase())
                .orElseThrow(() -> new NoAutorizadoException("Correo o contraseña incorrectos."));
        if (!encoder.matches(login.contrasena(), c.getContrasenaHash())) {
            actividad.inicioSesion(c.getIdCuenta(), c.getRol(), false);
            throw new NoAutorizadoException("Correo o contraseña incorrectos.");
        }
        if ("SUSPENDIDA".equals(c.getEstado())) {
            actividad.inicioSesion(c.getIdCuenta(), c.getRol(), false);
            throw new NoAutorizadoException("La cuenta está suspendida.");
        }
        actividad.inicioSesion(c.getIdCuenta(), c.getRol(), true);
        return sesion(c);
    }

    private AuthDto.Sesion sesion(Cuenta c) {
        return new AuthDto.Sesion(tokens.generar(c), "Bearer", tokens.expiracion(), c.getIdCuenta(), c.getAlias(),
                c.getRol());
    }

    /** Arreglo JSON que recibe sp_registrar_cuenta: [{"id":1,"nivel":4}, ...] */
    private static String aJson(List<AuthDto.EspecialidadNivel> lista) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            AuthDto.EspecialidadNivel e = lista.get(i);
            int nivel = e.nivel() == null ? NIVEL_INICIAL : e.nivel();
            if (i > 0) {
                sb.append(',');
            }
            sb.append("{\"id\":").append(e.id()).append(",\"nivel\":").append(nivel).append('}');
        }
        return sb.append(']').toString();
    }
}
