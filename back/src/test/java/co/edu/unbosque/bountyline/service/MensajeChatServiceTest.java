package co.edu.unbosque.bountyline.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import co.edu.unbosque.bountyline.dto.MensajeChatDto;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.model.MensajeChat;
import co.edu.unbosque.bountyline.model.Mision;
import co.edu.unbosque.bountyline.repository.MensajeChatRepository;
import co.edu.unbosque.bountyline.repository.MisionRepository;

class MensajeChatServiceTest {

    private MensajeChatRepository mensajes;
    private MisionRepository misiones;
    private MensajeChatService chat;

    @BeforeEach
    void preparar() {
        mensajes = mock(MensajeChatRepository.class);
        misiones = mock(MisionRepository.class);
        chat = new MensajeChatService(mensajes, misiones);
    }

    private void mision(String estado) {
        Mision m = mock(Mision.class);
        when(m.getIdUsuario()).thenReturn(4L);
        when(m.getIdCazarrecompensas()).thenReturn(9L);
        when(m.getEstado()).thenReturn(estado);
        when(misiones.buscarPorId(20L)).thenReturn(Optional.of(m));
    }

    @Test
    void unTerceroNoPuedeEscribir() {
        mision("EN_CURSO");
        assertThrows(AccessDeniedException.class,
                () -> chat.enviar(20L, 5L, "OTRO", "USUARIO", new MensajeChatDto.Nuevo("hola")));
        verify(mensajes, never()).insertar(any());
    }

    @Test
    void noSeEscribeEnMisionCerrada() {
        mision("CERRADA");
        assertThrows(ReglaNegocioException.class,
                () -> chat.enviar(20L, 4L, "AXIOM", "USUARIO", new MensajeChatDto.Nuevo("hola")));
    }

    @Test
    void elCazarrecompensasAsignadoEscribe() {
        mision("ASIGNADA");
        when(mensajes.insertar(any(MensajeChat.class))).thenAnswer(i -> i.getArgument(0));
        MensajeChatDto m = chat.enviar(20L, 9L, "RAVEN", "CAZARRECOMPENSAS", new MensajeChatDto.Nuevo("  voy en camino "));
        assertEquals("voy en camino", m.texto());
        assertEquals(9L, m.idEmisor());
        assertEquals(false, m.leido());
    }
}
