package co.edu.unbosque.bountyline.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.bountyline.dto.AuthDto;
import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.security.Sesion;
import co.edu.unbosque.bountyline.service.ActividadService;
import co.edu.unbosque.bountyline.service.AuthService;
import co.edu.unbosque.bountyline.service.CuentaService;
import jakarta.validation.Valid;

/** Registro, inicio de sesión y datos de la cuenta autenticada. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final CuentaService cuentas;
    private final ActividadService actividad;

    public AuthController(AuthService auth, CuentaService cuentas, ActividadService actividad) {
        this.auth = auth;
        this.cuentas = cuentas;
        this.actividad = actividad;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDto.Sesion registrar(@Valid @RequestBody AuthDto.Registro registro) {
        return auth.registrar(registro);
    }

    @PostMapping("/login")
    public AuthDto.Sesion login(@Valid @RequestBody AuthDto.Login login) {
        return auth.iniciarSesion(login);
    }

    /**
     * Cierre de sesión. El token JWT no se guarda en el servidor, así que el
     * front lo borra. Esta llamada solo deja el evento en la bitácora de actividad.
     */
    @PostMapping("/salida")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void salida(@AuthenticationPrincipal Jwt jwt) {
        actividad.cierreSesion(Sesion.id(jwt), Sesion.rol(jwt));
    }

    /** Cuenta dueña del token. */
    @GetMapping("/yo")
    public CuentaDto yo(@AuthenticationPrincipal Jwt jwt) {
        return cuentas.buscar(Sesion.id(jwt));
    }
}
