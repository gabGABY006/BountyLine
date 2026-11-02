package co.edu.unbosque.bountyline.model;

import java.time.LocalDateTime;

/** Tabla auditoria_cuenta: Registro de un cambio de estado o de correo de una cuenta. */
public class AuditoriaCuenta {

    private Long idAuditoria;
    private Long idCuenta;
    private String campoModificado;
    private String valorAnterior;
    private String valorNuevo;
    private LocalDateTime fechaCambio;
    private String usuarioBd;

    public AuditoriaCuenta() {
    }

    public AuditoriaCuenta(Long idAuditoria, Long idCuenta, String campoModificado, String valorAnterior, String valorNuevo, LocalDateTime fechaCambio, String usuarioBd) {
        this.idAuditoria = idAuditoria;
        this.idCuenta = idCuenta;
        this.campoModificado = campoModificado;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.fechaCambio = fechaCambio;
        this.usuarioBd = usuarioBd;
    }

    public Long getIdAuditoria() {
        return idAuditoria;
    }

    public void setIdAuditoria(Long idAuditoria) {
        this.idAuditoria = idAuditoria;
    }

    public Long getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Long idCuenta) {
        this.idCuenta = idCuenta;
    }

    public String getCampoModificado() {
        return campoModificado;
    }

    public void setCampoModificado(String campoModificado) {
        this.campoModificado = campoModificado;
    }

    public String getValorAnterior() {
        return valorAnterior;
    }

    public void setValorAnterior(String valorAnterior) {
        this.valorAnterior = valorAnterior;
    }

    public String getValorNuevo() {
        return valorNuevo;
    }

    public void setValorNuevo(String valorNuevo) {
        this.valorNuevo = valorNuevo;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }

    public String getUsuarioBd() {
        return usuarioBd;
    }

    public void setUsuarioBd(String usuarioBd) {
        this.usuarioBd = usuarioBd;
    }
}
