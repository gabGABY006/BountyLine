package co.edu.unbosque.bountyline.model;

import java.time.LocalDateTime;

public class Reporte {

    private Long idReporte;
    private Long idCuentaReporta;
    private Long idCuentaReportada;
    private String idContenido;
    private Long idAdministrador;
    private String motivo;
    private String estado;
    private LocalDateTime fechaReporte;
    private LocalDateTime fechaResolucion;

    public Reporte() {
    }

    public Reporte(Long idReporte, Long idCuentaReporta, Long idCuentaReportada, String idContenido, Long idAdministrador, String motivo, String estado, LocalDateTime fechaReporte, LocalDateTime fechaResolucion) {
        this.idReporte = idReporte;
        this.idCuentaReporta = idCuentaReporta;
        this.idCuentaReportada = idCuentaReportada;
        this.idContenido = idContenido;
        this.idAdministrador = idAdministrador;
        this.motivo = motivo;
        this.estado = estado;
        this.fechaReporte = fechaReporte;
        this.fechaResolucion = fechaResolucion;
    }

    public Long getIdReporte() {
        return idReporte;
    }

    public void setIdReporte(Long idReporte) {
        this.idReporte = idReporte;
    }

    public Long getIdCuentaReporta() {
        return idCuentaReporta;
    }

    public void setIdCuentaReporta(Long idCuentaReporta) {
        this.idCuentaReporta = idCuentaReporta;
    }

    public Long getIdCuentaReportada() {
        return idCuentaReportada;
    }

    public void setIdCuentaReportada(Long idCuentaReportada) {
        this.idCuentaReportada = idCuentaReportada;
    }

    public String getIdContenido() {
        return idContenido;
    }

    public void setIdContenido(String idContenido) {
        this.idContenido = idContenido;
    }

    public Long getIdAdministrador() {
        return idAdministrador;
    }

    public void setIdAdministrador(Long idAdministrador) {
        this.idAdministrador = idAdministrador;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaReporte() {
        return fechaReporte;
    }

    public void setFechaReporte(LocalDateTime fechaReporte) {
        this.fechaReporte = fechaReporte;
    }

    public LocalDateTime getFechaResolucion() {
        return fechaResolucion;
    }

    public void setFechaResolucion(LocalDateTime fechaResolucion) {
        this.fechaResolucion = fechaResolucion;
    }
}
