package co.edu.unbosque.bountyline.model;

/** Tabla administrador: Perfil con permisos de moderación y gestión de catálogos. */
public class Administrador {

    private Long idAdministrador;
    private String nombre;
    private String nivelAcceso;

    public Administrador() {
    }

    public Administrador(Long idAdministrador, String nombre, String nivelAcceso) {
        this.idAdministrador = idAdministrador;
        this.nombre = nombre;
        this.nivelAcceso = nivelAcceso;
    }

    public Long getIdAdministrador() {
        return idAdministrador;
    }

    public void setIdAdministrador(Long idAdministrador) {
        this.idAdministrador = idAdministrador;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNivelAcceso() {
        return nivelAcceso;
    }

    public void setNivelAcceso(String nivelAcceso) {
        this.nivelAcceso = nivelAcceso;
    }
}
