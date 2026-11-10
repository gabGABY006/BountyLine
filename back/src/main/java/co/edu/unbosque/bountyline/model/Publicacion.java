package co.edu.unbosque.bountyline.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "publicaciones")
public class Publicacion {

    @Id
    private String id;
    @Field("id_cuenta")
    private Integer idCuenta;
    private String alias;
    private String rol;
    private String texto;
    private List<String> etiquetas = new ArrayList<>();
    @Field("id_zona")
    private Integer idZona;
    private String zona;
    @Field("id_mision")
    private Integer idMision;
    private Reacciones reacciones = new Reacciones();
    private List<Reaccion> reaccionaron = new ArrayList<>();
    private List<Comentario> comentarios = new ArrayList<>();
    @Field("estado_moderacion")
    private String estadoModeracion;
    @Field("fecha_publicacion")
    private Instant fechaPublicacion;
    @Field("fecha_edicion")
    private Instant fechaEdicion;

    public Publicacion() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Integer getIdCuenta() { return idCuenta; }
    public void setIdCuenta(Integer idCuenta) { this.idCuenta = idCuenta; }
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public List<String> getEtiquetas() { return etiquetas; }
    public void setEtiquetas(List<String> etiquetas) { this.etiquetas = etiquetas; }
    public Integer getIdZona() { return idZona; }
    public void setIdZona(Integer idZona) { this.idZona = idZona; }
    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }
    public Integer getIdMision() { return idMision; }
    public void setIdMision(Integer idMision) { this.idMision = idMision; }
    public Reacciones getReacciones() { return reacciones; }
    public void setReacciones(Reacciones reacciones) { this.reacciones = reacciones; }
    public List<Reaccion> getReaccionaron() { return reaccionaron; }
    public void setReaccionaron(List<Reaccion> reaccionaron) { this.reaccionaron = reaccionaron; }
    public List<Comentario> getComentarios() { return comentarios; }
    public void setComentarios(List<Comentario> comentarios) { this.comentarios = comentarios; }
    public String getEstadoModeracion() { return estadoModeracion; }
    public void setEstadoModeracion(String estadoModeracion) { this.estadoModeracion = estadoModeracion; }
    public Instant getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(Instant fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public Instant getFechaEdicion() { return fechaEdicion; }
    public void setFechaEdicion(Instant fechaEdicion) { this.fechaEdicion = fechaEdicion; }

    public static class Reacciones {
        @Field("me_gusta")
        private Integer meGusta = 0;
        private Integer fuego = 0;
        private Integer alerta = 0;

        public Integer getMeGusta() { return meGusta; }
        public void setMeGusta(Integer meGusta) { this.meGusta = meGusta; }
        public Integer getFuego() { return fuego; }
        public void setFuego(Integer fuego) { this.fuego = fuego; }
        public Integer getAlerta() { return alerta; }
        public void setAlerta(Integer alerta) { this.alerta = alerta; }
    }

    public static class Reaccion {
        @Field("id_cuenta")
        private Integer idCuenta;
        private String tipo;

        public Reaccion() {
        }

        public Reaccion(Integer idCuenta, String tipo) {
            this.idCuenta = idCuenta;
            this.tipo = tipo;
        }

        public Integer getIdCuenta() { return idCuenta; }
        public void setIdCuenta(Integer idCuenta) { this.idCuenta = idCuenta; }
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
    }
}
