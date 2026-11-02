package com.bountyline.dto;

import java.math.BigDecimal;

/** Fila de la vista v_cazarrecompensas_perfil. */
public record CazarrecompensasDto(Long idCazarrecompensas, String alias, String estadoCuenta, String biografia,
                                  String disponibilidad, BigDecimal reputacion, Long idZona, String zona,
                                  Integer misionesCompletadas, String especialidades) {
}
