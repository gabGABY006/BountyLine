package com.bountyline.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bountyline.dto.CuentaDtos;
import com.bountyline.exception.ReglaNegocioException;
import com.bountyline.repository.CuentaRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CuentaService {

    private final CuentaRepository cuentas;
    private final PasswordEncoder encoder;
    private final ObjectMapper json;

    public CuentaService(CuentaRepository cuentas, PasswordEncoder encoder, ObjectMapper json) {
        this.cuentas = cuentas;
        this.encoder = encoder;
        this.json = json;
    }

    /** Registra un Usuario o un Cazarrecompensas (los administradores se crean por script, S30). */
    public CuentaDtos.Sesion registrar(CuentaDtos.Registro r) {
        String especialidades = null;
        if ("CAZARRECOMPENSAS".equals(r.rol())) {
            List<CuentaDtos.EspecialidadNivel> lista = r.especialidades();
            if (r.idZona() == null || lista == null || lista.isEmpty()) {
                throw new ReglaNegocioException("El cazarrecompensas necesita una zona base y al menos una especialidad.");
            }
            try {
                especialidades = json.writeValueAsString(lista);
            } catch (JsonProcessingException e) {
                throw new ReglaNegocioException("Las especialidades no tienen un formato válido.");
            }
        }
        String hash = encoder.encode(r.contrasena());
        Long id = cuentas.registrar(r.correo().trim().toLowerCase(), r.alias().trim(), hash, r.rol(),
                r.biografia(), "CAZARRECOMPENSAS".equals(r.rol()) ? r.idZona() : null, especialidades);
        return new CuentaDtos.Sesion(id, r.alias().trim(), r.rol());
    }

    /** Inicio de sesión básico con correo y contraseña (S16). */
    public CuentaDtos.Sesion iniciarSesion(CuentaDtos.Login login) {
        CuentaRepository.Credenciales c = cuentas.buscarPorCorreo(login.correo().trim().toLowerCase())
                .orElseThrow(() -> new ReglaNegocioException("Correo o contraseña incorrectos."));
        if (!encoder.matches(login.contrasena(), c.contrasenaHash())) {
            throw new ReglaNegocioException("Correo o contraseña incorrectos.");
        }
        if ("SUSPENDIDA".equals(c.estado())) {
            throw new ReglaNegocioException("La cuenta está suspendida.");
        }
        return new CuentaDtos.Sesion(c.idCuenta(), c.alias(), c.rol());
    }
}
