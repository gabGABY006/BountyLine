package co.edu.unbosque.bountyline.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Tabla movimiento: Movimiento de créditos de una billetera. */
public class Movimiento {

    private Long idMovimiento;
    private Long idBilletera;
    private Long idMision;
    private String tipo;
    private BigDecimal monto;
    private LocalDateTime fecha;
    private String descripcion;

    public Movimiento() {
    }

    public Movimiento(Long idMovimiento, Long idBilletera, Long idMision, String tipo, BigDecimal monto, LocalDateTime fecha, String descripcion) {
        this.idMovimiento = idMovimiento;
        this.idBilletera = idBilletera;
        this.idMision = idMision;
        this.tipo = tipo;
        this.monto = monto;
        this.fecha = fecha;
        this.descripcion = descripcion;
    }

    public Long getIdMovimiento() {
        return idMovimiento;
    }

    public void setIdMovimiento(Long idMovimiento) {
        this.idMovimiento = idMovimiento;
    }

    public Long getIdBilletera() {
        return idBilletera;
    }

    public void setIdBilletera(Long idBilletera) {
        this.idBilletera = idBilletera;
    }

    public Long getIdMision() {
        return idMision;
    }

    public void setIdMision(Long idMision) {
        this.idMision = idMision;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
