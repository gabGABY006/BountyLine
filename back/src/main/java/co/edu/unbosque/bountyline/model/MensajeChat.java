package co.edu.unbosque.bountyline.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/** Mensaje del chat de una misión (MongoDB), entre el usuario y el cazarrecompensas asignado (S82, S83). */
@Document(collection = "mensajes_chat")
public class MensajeChat {

    @Id
    private String id;
    @Field("id_mision")
    private Integer idMision;
    @Field("id_emisor")
    private Integer idEmisor;
    @Field("alias_emisor")
    private String aliasEmisor;
    @Field("rol_emisor")
    private String rolEmisor;
    private String texto;
    private Instant fecha;
    private Boolean leido;

    public MensajeChat() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Integer getIdMision() { return idMision; }
    public void setIdMision(Integer idMision) { this.idMision = idMision; }
    public Integer getIdEmisor() { return idEmisor; }
    public void setIdEmisor(Integer idEmisor) { this.idEmisor = idEmisor; }
    public String getAliasEmisor() { return aliasEmisor; }
    public void setAliasEmisor(String aliasEmisor) { this.aliasEmisor = aliasEmisor; }
    public String getRolEmisor() { return rolEmisor; }
    public void setRolEmisor(String rolEmisor) { this.rolEmisor = rolEmisor; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public Instant getFecha() { return fecha; }
    public void setFecha(Instant fecha) { this.fecha = fecha; }
    public Boolean getLeido() { return leido; }
    public void setLeido(Boolean leido) { this.leido = leido; }
}
