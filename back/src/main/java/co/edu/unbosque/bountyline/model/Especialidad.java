package co.edu.unbosque.bountyline.model;

/** Tabla especialidad: Tipo de trabajo que realiza un cazarrecompensas. */
public class Especialidad {

    private Long idEspecialidad;
    private String nombre;
    private String descripcion;
    private Long idAdministrador;

    public Especialidad() {
    }

    public Especialidad(Long idEspecialidad, String nombre, String descripcion, Long idAdministrador) {
        this.idEspecialidad = idEspecialidad;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.idAdministrador = idAdministrador;
    }

    public Long getIdEspecialidad() {
        return idEspecialidad;
    }

    public void setIdEspecialidad(Long idEspecialidad) {
        this.idEspecialidad = idEspecialidad;
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

    public Long getIdAdministrador() {
        return idAdministrador;
    }

    public void setIdAdministrador(Long idAdministrador) {
        this.idAdministrador = idAdministrador;
    }
}
