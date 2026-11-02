package co.edu.unbosque.bountyline.model;

import java.time.LocalDateTime;

/** Tabla postulacion: Postulación de un cazarrecompensas a una misión (relación N:M). */
public class Postulacion {

    private Long idMision;
    private Long idCazarrecompensas;
    private LocalDateTime fechaPostulacion;
    private String mensaje;
    private String estadoPostulacion;

    public Postulacion() {
    }

    public Postulacion(Long idMision, Long idCazarrecompensas, LocalDateTime fechaPostulacion, String mensaje, String estadoPostulacion) {
        this.idMision = idMision;
        this.idCazarrecompensas = idCazarrecompensas;
        this.fechaPostulacion = fechaPostulacion;
        this.mensaje = mensaje;
        this.estadoPostulacion = estadoPostulacion;
    }

    public Long getIdMision() {
        return idMision;
    }

    public void setIdMision(Long idMision) {
        this.idMision = idMision;
    }

    public Long getIdCazarrecompensas() {
        return idCazarrecompensas;
    }

    public void setIdCazarrecompensas(Long idCazarrecompensas) {
        this.idCazarrecompensas = idCazarrecompensas;
    }

    public LocalDateTime getFechaPostulacion() {
        return fechaPostulacion;
    }

    public void setFechaPostulacion(LocalDateTime fechaPostulacion) {
        this.fechaPostulacion = fechaPostulacion;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getEstadoPostulacion() {
        return estadoPostulacion;
    }

    public void setEstadoPostulacion(String estadoPostulacion) {
        this.estadoPostulacion = estadoPostulacion;
    }
}
