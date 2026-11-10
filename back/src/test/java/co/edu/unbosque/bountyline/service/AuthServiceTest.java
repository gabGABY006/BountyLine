package co.edu.unbosque.bountyline.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import co.edu.unbosque.bountyline.dto.AuthDto;
import co.edu.unbosque.bountyline.exception.NoAutorizadoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;
import co.edu.unbosque.bountyline.security.TokenService;

class AuthServiceTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private CuentaRepository cuentas;
    private TokenService tokens;
    private ActividadService actividad;
    private AuthService auth;

    @BeforeEach
    void preparar() {
        cuentas = mock(CuentaRepository.class);
        tokens = mock(TokenService.class);
        when(tokens.generar(any(Cuenta.class))).thenReturn("token-de-prueba");
        when(tokens.expiracion()).thenReturn(Instant.now().plusSeconds(3600));
        actividad = mock(ActividadService.class);
        auth = new AuthService(cuentas, encoder, tokens, actividad);
    }

    private Cuenta cuenta(String estado, String contrasena) {
        return new Cuenta(7L, "axiom@bountyline.gg", "AXIOM", encoder.encode(contrasena), "USUARIO", estado,
                LocalDateTime.now());
    }

    @Test
    void cazarrecompensasSinZonaNoSeRegistra() {
        AuthDto.Registro r = new AuthDto.Registro("caz@bountyline.gg", "CAZ", "Clave12345", "CAZARRECOMPENSAS",
                null, null, List.of(new AuthDto.EspecialidadNivel(1L, 3)));
        assertThrows(ReglaNegocioException.class, () -> auth.registrar(r));
        verify(cuentas, never()).registrar(anyString(), anyString(), anyString(), anyString(), any(), any(), any());
    }

    @Test
    void registroArmaElJsonConNivelPorDefectoYGuardaElHash() {
        AuthDto.Registro r = new AuthDto.Registro("  Caz@BountyLine.gg ", "CAZ", "Clave12345", "CAZARRECOMPENSAS",
                "  ", 2L, List.of(new AuthDto.EspecialidadNivel(3L, null), new AuthDto.EspecialidadNivel(4L, 5)));
        when(cuentas.registrar(anyString(), anyString(), anyString(), anyString(), any(), any(), any())).thenReturn(7L);
        when(cuentas.buscarPorId(7L)).thenReturn(Optional.of(cuenta("ACTIVA", "Clave12345")));

        AuthDto.Sesion sesion = auth.registrar(r);

        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        verify(cuentas).registrar(eq("caz@bountyline.gg"), eq("CAZ"), hash.capture(), eq("CAZARRECOMPENSAS"),
                eq(null), eq(2L), eq("[{\"id\":3,\"nivel\":1},{\"id\":4,\"nivel\":5}]"));
        assertTrue(encoder.matches("Clave12345", hash.getValue()));
        assertEquals("token-de-prueba", sesion.token());
        assertEquals("Bearer", sesion.tipo());
    }

    @Test
    void usuarioSeRegistraSinZonaNiEspecialidades() {
        AuthDto.Registro r = new AuthDto.Registro("u@bountyline.gg", "USU", "Clave12345", "USUARIO",
                "Hola", 2L, List.of(new AuthDto.EspecialidadNivel(3L, 2)));
        when(cuentas.registrar(anyString(), anyString(), anyString(), anyString(), any(), any(), any())).thenReturn(7L);
        when(cuentas.buscarPorId(7L)).thenReturn(Optional.of(cuenta("ACTIVA", "Clave12345")));

        auth.registrar(r);

        verify(cuentas).registrar(eq("u@bountyline.gg"), eq("USU"), anyString(), eq("USUARIO"), eq("Hola"),
                eq(null), eq(null));
    }

    @Test
    void loginConContrasenaIncorrectaResponde401() {
        when(cuentas.buscarPorCorreo("axiom@bountyline.gg")).thenReturn(Optional.of(cuenta("ACTIVA", "Clave12345")));
        assertThrows(NoAutorizadoException.class,
                () -> auth.iniciarSesion(new AuthDto.Login("axiom@bountyline.gg", "otra")));
    }

    @Test
    void loginConCorreoInexistenteResponde401() {
        when(cuentas.buscarPorCorreo(anyString())).thenReturn(Optional.empty());
        assertThrows(NoAutorizadoException.class,
                () -> auth.iniciarSesion(new AuthDto.Login("nadie@bountyline.gg", "Clave12345")));
    }

    @Test
    void cuentaSuspendidaNoPuedeIniciarSesion() {
        when(cuentas.buscarPorCorreo("axiom@bountyline.gg")).thenReturn(Optional.of(cuenta("SUSPENDIDA", "Clave12345")));
        assertThrows(NoAutorizadoException.class,
                () -> auth.iniciarSesion(new AuthDto.Login("axiom@bountyline.gg", "Clave12345")));
    }

    @Test
    void loginCorrectoDevuelveTokenYRol() {
        when(cuentas.buscarPorCorreo("axiom@bountyline.gg")).thenReturn(Optional.of(cuenta("ACTIVA", "Clave12345")));

        AuthDto.Sesion sesion = auth.iniciarSesion(new AuthDto.Login(" AXIOM@bountyline.gg ", "Clave12345"));

        assertEquals("token-de-prueba", sesion.token());
        assertEquals(7L, sesion.idCuenta());
        assertEquals("USUARIO", sesion.rol());
    }
}
