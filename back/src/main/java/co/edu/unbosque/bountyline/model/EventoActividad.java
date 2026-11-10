package co.edu.unbosque.bountyline.model;

import java.time.Instant;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "bitacora_actividad")
public class EventoActividad {

    @Id
    private String id;
    private String tipo;
    @Field("id_cuenta")
    private Integer idCuenta;
    private String rol;
    private Instant fecha;
    private Boolean exito;
    private String pantalla;
    private Map<String, Object> filtros;
    private Integer resultados;
    @Field("id_mision")
    private Integer idMision;
    @Field("id_cuenta_vista")
    private Integer idCuentaVista;

    public EventoActividad() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Integer getIdCuenta() { return idCuenta; }
    public void setIdCuenta(Integer idCuenta) { this.idCuenta = idCuenta; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Instant getFecha() { return fecha; }
    public void setFecha(Instant fecha) { this.fecha = fecha; }
    public Boolean getExito() { return exito; }
    public void setExito(Boolean exito) { this.exito = exito; }
    public String getPantalla() { return pantalla; }
    public void setPantalla(String pantalla) { this.pantalla = pantalla; }
    public Map<String, Object> getFiltros() { return filtros; }
    public void setFiltros(Map<String, Object> filtros) { this.filtros = filtros; }
    public Integer getResultados() { return resultados; }
    public void setResultados(Integer resultados) { this.resultados = resultados; }
    public Integer getIdMision() { return idMision; }
    public void setIdMision(Integer idMision) { this.idMision = idMision; }
    public Integer getIdCuentaVista() { return idCuentaVista; }
    public void setIdCuentaVista(Integer idCuentaVista) { this.idCuentaVista = idCuentaVista; }
}
