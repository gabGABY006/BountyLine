package co.edu.unbosque.bountyline.model;

/** Tabla zona: Distrito del mundo del juego. */
public class Zona {

    private Long idZona;
    private String nombre;
    private String descripcion;
    private Integer nivelPeligro;
    private Long idAdministrador;

    public Zona() {
    }

    public Zona(Long idZona, String nombre, String descripcion, Integer nivelPeligro, Long idAdministrador) {
        this.idZona = idZona;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.nivelPeligro = nivelPeligro;
        this.idAdministrador = idAdministrador;
    }

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getNivelPeligro() {
        return nivelPeligro;
    }

    public void setNivelPeligro(Integer nivelPeligro) {
        this.nivelPeligro = nivelPeligro;
    }

    public Long getIdAdministrador() {
        return idAdministrador;
    }

    public void setIdAdministrador(Long idAdministrador) {
        this.idAdministrador = idAdministrador;
    }
}
