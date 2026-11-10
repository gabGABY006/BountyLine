package co.edu.unbosque.bountyline.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CazarrecompensasDto(Long idCazarrecompensas, String alias, String estadoCuenta, String biografia,
                                  String disponibilidad, BigDecimal reputacion, Long idZona, String zona,
                                  Integer misionesCompletadas, String especialidades) {

    public record Resumen(BigDecimal totalCobrado, BigDecimal cobradoUltimos30Dias, Integer misionesCompletadas,
                          Integer misionesActivas, Integer postulacionesPendientes, Integer calificaciones,
                          BigDecimal reputacion, BigDecimal saldoDisponible) {
    }

    public record Actualizacion(@NotNull Long idZona, @Size(max = 500) String biografia,
                                @NotNull @Pattern(regexp = "DISPONIBLE|NO_DISPONIBLE") String disponibilidad) {
    }
}
