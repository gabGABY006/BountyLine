package co.edu.unbosque.bountyline.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Tabla mision: Encargo publicado por un usuario. */
public class Mision {

    private Long idMision;
    private Long idUsuario;
    private Long idZona;
    private Long idEspecialidad;
    private Long idCazarrecompensas;
    private Long idAdminCancela;
    private String titulo;
    private String descripcion;
    private BigDecimal montoRecompensa;
    private String estado;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaCierre;

    public Mision() {
    }

    public Mision(Long idMision, Long idUsuario, Long idZona, Long idEspecialidad, Long idCazarrecompensas, Long idAdminCancela, String titulo, String descripcion, BigDecimal montoRecompensa, String estado, LocalDateTime fechaPublicacion, LocalDateTime fechaCierre) {
        this.idMision = idMision;
        this.idUsuario = idUsuario;
        this.idZona = idZona;
        this.idEspecialidad = idEspecialidad;
        this.idCazarrecompensas = idCazarrecompensas;
        this.idAdminCancela = idAdminCancela;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.montoRecompensa = montoRecompensa;
        this.estado = estado;
        this.fechaPublicacion = fechaPublicacion;
        this.fechaCierre = fechaCierre;
    }

    public Long getIdMision() {
        return idMision;
    }

    public void setIdMision(Long idMision) {
        this.idMision = idMision;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public Long getIdEspecialidad() {
        return idEspecialidad;
    }

    public void setIdEspecialidad(Long idEspecialidad) {
        this.idEspecialidad = idEspecialidad;
    }

    public Long getIdCazarrecompensas() {
        return idCazarrecompensas;
    }

    public void setIdCazarrecompensas(Long idCazarrecompensas) {
        this.idCazarrecompensas = idCazarrecompensas;
    }

    public Long getIdAdminCancela() {
        return idAdminCancela;
    }

    public void setIdAdminCancela(Long idAdminCancela) {
        this.idAdminCancela = idAdminCancela;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getMontoRecompensa() {
        return montoRecompensa;
    }

    public void setMontoRecompensa(BigDecimal montoRecompensa) {
        this.montoRecompensa = montoRecompensa;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion;
    }

    public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }
}
