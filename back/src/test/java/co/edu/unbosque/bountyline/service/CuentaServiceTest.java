package co.edu.unbosque.bountyline.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import co.edu.unbosque.bountyline.dto.CuentaDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.Cuenta;
import co.edu.unbosque.bountyline.repository.CuentaRepository;

class CuentaServiceTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private CuentaRepository cuentas;
    private CuentaService servicio;

    @BeforeEach
    void preparar() {
        cuentas = mock(CuentaRepository.class);
        servicio = new CuentaService(cuentas, encoder);
        when(cuentas.buscarPorId(5L)).thenReturn(Optional.of(new Cuenta(5L, "a@bountyline.gg", "A",
                encoder.encode("Actual1234"), "USUARIO", "ACTIVA", LocalDateTime.now())));
    }

    @Test
    void contrasenaActualIncorrectaNoSeCambia() {
        assertThrows(ReglaNegocioException.class,
                () -> servicio.cambiarContrasena(5L, new CuentaDto.CambioContrasena("Mala12345", "Nueva12345")));
        verify(cuentas, never()).cambiarContrasena(anyLong(), anyString());
    }

    @Test
    void nuevaIgualALaActualNoSeAcepta() {
        assertThrows(ReglaNegocioException.class,
                () -> servicio.cambiarContrasena(5L, new CuentaDto.CambioContrasena("Actual1234", "Actual1234")));
    }

    @Test
    void cuentaInexistenteResponde404() {
        when(cuentas.buscarPorId(9L)).thenReturn(Optional.empty());
        assertThrows(NoEncontradoException.class,
                () -> servicio.cambiarContrasena(9L, new CuentaDto.CambioContrasena("Actual1234", "Nueva12345")));
    }

    @Test
    void cambioCorrectoGuardaSoloElHash() {
        servicio.cambiarContrasena(5L, new CuentaDto.CambioContrasena("Actual1234", "Nueva12345"));

        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        verify(cuentas).cambiarContrasena(eq(5L), hash.capture());
        assertTrue(hash.getValue().startsWith("$2"));
        assertTrue(encoder.matches("Nueva12345", hash.getValue()));
    }
}
