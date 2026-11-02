package com.bountyline.exception;

/** Regla de negocio incumplida que se detecta en la aplicación (respuesta 400). */
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
