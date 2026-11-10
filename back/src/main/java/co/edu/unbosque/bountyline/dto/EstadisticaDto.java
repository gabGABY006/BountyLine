package co.edu.unbosque.bountyline.dto;

import java.util.List;

public final class EstadisticaDto {

    private EstadisticaDto() {
    }

    public record EtiquetaUso(String etiqueta, Integer usos) {
    }

    public record EtiquetasZona(String zona, List<EtiquetaUso> etiquetas) {
    }

    public record PublicacionesSemana(Integer anio, Integer semana, Integer publicaciones, Integer comentarios) {
    }

    public record MensajesMision(Integer misionesConChat, Double promedio, Integer maximo) {
    }

    public record FiltroUso(String pantalla, String filtro, Integer veces) {
    }
}
