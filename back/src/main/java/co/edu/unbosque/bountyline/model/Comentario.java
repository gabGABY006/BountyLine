package co.edu.unbosque.bountyline.model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Field;

public class Comentario {

    @Field("_id")
    private ObjectId id;
    @Field("id_cuenta")
    private Integer idCuenta;
    private String alias;
    private String texto;
    private Instant fecha;
    @Field("estado_moderacion")
    private String estadoModeracion;

    public Comentario() {
    }

    public Comentario(ObjectId id, Integer idCuenta, String alias, String texto, Instant fecha,
                      String estadoModeracion) {
        this.id = id;
        this.idCuenta = idCuenta;
        this.alias = alias;
        this.texto = texto;
        this.fecha = fecha;
        this.estadoModeracion = estadoModeracion;
    }

    public ObjectId getId() { return id; }
    public void setId(ObjectId id) { this.id = id; }
    public Integer getIdCuenta() { return idCuenta; }
    public void setIdCuenta(Integer idCuenta) { this.idCuenta = idCuenta; }
    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public Instant getFecha() { return fecha; }
    public void setFecha(Instant fecha) { this.fecha = fecha; }
    public String getEstadoModeracion() { return estadoModeracion; }
    public void setEstadoModeracion(String estadoModeracion) { this.estadoModeracion = estadoModeracion; }
}
