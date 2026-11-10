package co.edu.unbosque.bountyline.model;

public class CazarrecompensasEspecialidad {

    private Long idCazarrecompensas;
    private Long idEspecialidad;
    private Integer nivel;

    public CazarrecompensasEspecialidad() {
    }

    public CazarrecompensasEspecialidad(Long idCazarrecompensas, Long idEspecialidad, Integer nivel) {
        this.idCazarrecompensas = idCazarrecompensas;
        this.idEspecialidad = idEspecialidad;
        this.nivel = nivel;
    }

    public Long getIdCazarrecompensas() {
        return idCazarrecompensas;
    }

    public void setIdCazarrecompensas(Long idCazarrecompensas) {
        this.idCazarrecompensas = idCazarrecompensas;
    }

    public Long getIdEspecialidad() {
        return idEspecialidad;
    }

    public void setIdEspecialidad(Long idEspecialidad) {
        this.idEspecialidad = idEspecialidad;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void setNivel(Integer nivel) {
        this.nivel = nivel;
    }
}
