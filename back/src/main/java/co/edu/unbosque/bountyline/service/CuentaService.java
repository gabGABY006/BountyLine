package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CuentaDtos;
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

    /** Registra un Usuario o un Cazarrecompensas (los administradores se crean por script, S30). */
    public CuentaDtos.Sesion registrar(CuentaDtos.Registro r) {
        String especialidades = null;
        if ("CAZARRECOMPENSAS".equals(r.rol())) {
            List<CuentaDtos.EspecialidadNivel> lista = r.especialidades();
            if (r.idZona() == null || lista == null || lista.isEmpty()) {
                throw new ReglaNegocioException("El cazarrecompensas necesita una zona base y al menos una especialidad.");
            }
            especialidades = aJson(lista);
        }
        String hash = encoder.encode(r.contrasena());
        Long id = cuentas.registrar(r.correo().trim().toLowerCase(), r.alias().trim(), hash, r.rol(),
                r.biografia(), "CAZARRECOMPENSAS".equals(r.rol()) ? r.idZona() : null, especialidades);
        return new CuentaDtos.Sesion(id, r.alias().trim(), r.rol());
    }

    /** Arreglo JSON que recibe sp_registrar_cuenta: [{"id":1,"nivel":4}, ...] */
    private static String aJson(List<CuentaDtos.EspecialidadNivel> lista) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            CuentaDtos.EspecialidadNivel e = lista.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append("{\"id\":").append(e.id()).append(",\"nivel\":").append(e.nivel()).append('}');
        }
        return sb.append(']').toString();
    }

    /** Inicio de sesión básico con correo y contraseña (S16). */
    public CuentaDtos.Sesion iniciarSesion(CuentaDtos.Login login) {
        Cuenta c = cuentas.buscarPorCorreo(login.correo().trim().toLowerCase())
                .orElseThrow(() -> new ReglaNegocioException("Correo o contraseña incorrectos."));
        if (!encoder.matches(login.contrasena(), c.getContrasenaHash())) {
            throw new ReglaNegocioException("Correo o contraseña incorrectos.");
        }
        if ("SUSPENDIDA".equals(c.getEstado())) {
            throw new ReglaNegocioException("La cuenta está suspendida.");
        }
        return new CuentaDtos.Sesion(c.getIdCuenta(), c.getAlias(), c.getRol());
    }
}
