package co.edu.unbosque.bountyline.model;

import java.time.LocalDateTime;

/** Tabla calificacion: Calificación de una misión cerrada. */
public class Calificacion {

    private Long idCalificacion;
    private Long idMision;
    private Integer puntaje;
    private String comentario;
    private LocalDateTime fecha;

    public Calificacion() {
    }

    public Calificacion(Long idCalificacion, Long idMision, Integer puntaje, String comentario, LocalDateTime fecha) {
        this.idCalificacion = idCalificacion;
        this.idMision = idMision;
        this.puntaje = puntaje;
        this.comentario = comentario;
        this.fecha = fecha;
    }

    public Long getIdCalificacion() {
        return idCalificacion;
    }

    public void setIdCalificacion(Long idCalificacion) {
        this.idCalificacion = idCalificacion;
    }

    public Long getIdMision() {
        return idMision;
    }

    public void setIdMision(Long idMision) {
        this.idMision = idMision;
    }

    public Integer getPuntaje() {
        return puntaje;
    }

    public void setPuntaje(Integer puntaje) {
        this.puntaje = puntaje;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
