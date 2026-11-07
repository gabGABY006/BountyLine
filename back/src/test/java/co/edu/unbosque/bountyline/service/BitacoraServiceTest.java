package co.edu.unbosque.bountyline.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.repository.BitacoraRepository;

class BitacoraServiceTest {

    private BitacoraRepository bitacora;
    private BitacoraService servicio;

    @BeforeEach
    void preparar() {
        bitacora = mock(BitacoraRepository.class);
        servicio = new BitacoraService(bitacora);
    }

    @Test
    void tipoDesconocidoSeRechaza() {
        assertThrows(ReglaNegocioException.class, () -> servicio.listar("OTRO", null, null, null, 10));
        verify(bitacora, never()).listar(any(), any(), any(), any(), anyInt());
    }

    @Test
    void rangoDeFechasInvertidoSeRechaza() {
        assertThrows(ReglaNegocioException.class,
                () -> servicio.listar(null, null, LocalDate.of(2026, 5, 2), LocalDate.of(2026, 5, 1), 10));
    }

    @Test
    void elLimiteSeAjustaEntre1Y500() {
        servicio.listar("PAGO", null, null, null, 10_000);
        verify(bitacora).listar(eq("PAGO"), eq(null), eq(null), eq(null), eq(500));
        servicio.listar(null, null, null, null, 0);
        verify(bitacora).listar(eq(null), eq(null), eq(null), eq(null), eq(1));
    }
}
