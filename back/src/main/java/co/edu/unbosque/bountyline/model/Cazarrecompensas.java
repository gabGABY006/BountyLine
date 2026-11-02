package co.edu.unbosque.bountyline.model;

import java.math.BigDecimal;

/** Tabla cazarrecompensas: Perfil del jugador que resuelve misiones. */
public class Cazarrecompensas {

    private Long idCazarrecompensas;
    private Long idZona;
    private String biografia;
    private String disponibilidad;
    private BigDecimal reputacion;

    public Cazarrecompensas() {
    }

    public Cazarrecompensas(Long idCazarrecompensas, Long idZona, String biografia, String disponibilidad, BigDecimal reputacion) {
        this.idCazarrecompensas = idCazarrecompensas;
        this.idZona = idZona;
        this.biografia = biografia;
        this.disponibilidad = disponibilidad;
        this.reputacion = reputacion;
    }

    public Long getIdCazarrecompensas() {
        return idCazarrecompensas;
    }

    public void setIdCazarrecompensas(Long idCazarrecompensas) {
        this.idCazarrecompensas = idCazarrecompensas;
    }

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public String getDisponibilidad() {
        return disponibilidad;
    }

    public void setDisponibilidad(String disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    public BigDecimal getReputacion() {
        return reputacion;
    }

    public void setReputacion(BigDecimal reputacion) {
        this.reputacion = reputacion;
    }
}
