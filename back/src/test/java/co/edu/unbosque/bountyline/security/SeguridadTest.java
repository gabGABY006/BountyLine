package co.edu.unbosque.bountyline.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;

class SeguridadTest {

    private static final SecretKey CLAVE = new SecretKeySpec(
            "clave-de-prueba-de-al-menos-32-caracteres!".getBytes(StandardCharsets.UTF_8), "HmacSHA256");

    private static Jwt jwt(String sub, String rol) {
        return Jwt.withTokenValue("t").header("alg", "HS256").subject(sub).claim("rol", rol).build();
    }

    @Test
    void elTokenLlevaIdRolYAlias() {
        TokenService tokens = new TokenService(new NimbusJwtEncoder(new ImmutableSecret<>(CLAVE)), 8);
        Cuenta c = new Cuenta(3L, "a@bountyline.gg", "AXIOM_47", "x", "USUARIO", "ACTIVA", LocalDateTime.now());

        String token = tokens.generar(c);
        Jwt leido = NimbusJwtDecoder.withSecretKey(CLAVE).macAlgorithm(MacAlgorithm.HS256).build().decode(token);

        assertEquals("3", leido.getSubject());
        assertEquals("USUARIO", leido.getClaimAsString("rol"));
        assertEquals("AXIOM_47", leido.getClaimAsString("alias"));
    }

    @Test
    void sesionLeeIdYRol() {
        Jwt j = jwt("12", Sesion.ADMINISTRADOR);
        assertEquals(12L, Sesion.id(j));
        assertTrue(Sesion.esAdministrador(j));
    }

    @Test
    void soloLaPropiaCuentaOUnAdministradorPasan() {
        assertDoesNotThrow(() -> Sesion.exigirPropiaOAdministrador(jwt("5", Sesion.USUARIO), 5L));
        assertDoesNotThrow(() -> Sesion.exigirPropiaOAdministrador(jwt("1", Sesion.ADMINISTRADOR), 5L));
        assertThrows(AccessDeniedException.class,
                () -> Sesion.exigirPropiaOAdministrador(jwt("6", Sesion.USUARIO), 5L));
    }

    @Test
    void cuentaSuspendidaOInexistenteInvalidaElToken() {
        CuentaRepository cuentas = mock(CuentaRepository.class);
        when(cuentas.estado(1L)).thenReturn(Optional.of("ACTIVA"));
        when(cuentas.estado(2L)).thenReturn(Optional.of("SUSPENDIDA"));
        when(cuentas.estado(3L)).thenReturn(Optional.empty());
        CuentaActivaValidator validador = new CuentaActivaValidator(cuentas);

        assertFalse(validador.validate(jwt("1", Sesion.USUARIO)).hasErrors());
        assertTrue(validador.validate(jwt("2", Sesion.USUARIO)).hasErrors());
        assertTrue(validador.validate(jwt("3", Sesion.USUARIO)).hasErrors());
        assertTrue(validador.validate(jwt("abc", Sesion.USUARIO)).hasErrors());
    }
}
