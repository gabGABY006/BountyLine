package co.edu.unbosque.bountyline.model;

import java.time.LocalDateTime;

/** Tabla cuenta: Cuenta de acceso (superclase de Usuario, Cazarrecompensas y Administrador). */
public class Cuenta {

    private Long idCuenta;
    private String correo;
    private String alias;
    private String contrasenaHash;
    private String rol;
    private String estado;
    private LocalDateTime fechaRegistro;

    public Cuenta() {
    }

    public Cuenta(Long idCuenta, String correo, String alias, String contrasenaHash, String rol, String estado, LocalDateTime fechaRegistro) {
        this.idCuenta = idCuenta;
        this.correo = correo;
        this.alias = alias;
        this.contrasenaHash = contrasenaHash;
        this.rol = rol;
        this.estado = estado;
        this.fechaRegistro = fechaRegistro;
    }

    public Long getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Long idCuenta) {
        this.idCuenta = idCuenta;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getContrasenaHash() {
        return contrasenaHash;
    }

    public void setContrasenaHash(String contrasenaHash) {
        this.contrasenaHash = contrasenaHash;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
