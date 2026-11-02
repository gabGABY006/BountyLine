package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import co.edu.unbosque.bountyline.model.AuditoriaCuenta;

public record AuditoriaCuentaDto(Long idAuditoria, Long idCuenta, String campoModificado, String valorAnterior,
                                 String valorNuevo, LocalDateTime fechaCambio, String usuarioBd) {

    public static AuditoriaCuentaDto desde(AuditoriaCuenta a) {
        return new AuditoriaCuentaDto(a.getIdAuditoria(), a.getIdCuenta(), a.getCampoModificado(),
                a.getValorAnterior(), a.getValorNuevo(), a.getFechaCambio(), a.getUsuarioBd());
    }
}
