package co.edu.unbosque.bountyline.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Billetera {

    private Long idBilletera;
    private Long idCuenta;
    private BigDecimal saldoDisponible;
    private BigDecimal saldoRetenido;
    private LocalDateTime fechaActualizacion;

    public Billetera() {
    }

    public Billetera(Long idBilletera, Long idCuenta, BigDecimal saldoDisponible, BigDecimal saldoRetenido, LocalDateTime fechaActualizacion) {
        this.idBilletera = idBilletera;
        this.idCuenta = idCuenta;
        this.saldoDisponible = saldoDisponible;
        this.saldoRetenido = saldoRetenido;
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getIdBilletera() {
        return idBilletera;
    }

    public void setIdBilletera(Long idBilletera) {
        this.idBilletera = idBilletera;
    }

    public Long getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Long idCuenta) {
        this.idCuenta = idCuenta;
    }

    public BigDecimal getSaldoDisponible() {
        return saldoDisponible;
    }

    public void setSaldoDisponible(BigDecimal saldoDisponible) {
        this.saldoDisponible = saldoDisponible;
    }

    public BigDecimal getSaldoRetenido() {
        return saldoRetenido;
    }

    public void setSaldoRetenido(BigDecimal saldoRetenido) {
        this.saldoRetenido = saldoRetenido;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
