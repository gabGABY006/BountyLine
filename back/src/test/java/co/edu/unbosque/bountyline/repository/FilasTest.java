package co.edu.unbosque.bountyline.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class FilasTest {

    @Test
    void contieneEscapaLosComodinesDelLike() {
        assertEquals("%muelle%", Filas.contiene("  muelle "));
        assertEquals("%50\\%%", Filas.contiene("50%"));
        assertEquals("%a\\_b%", Filas.contiene("a_b"));
    }
}
