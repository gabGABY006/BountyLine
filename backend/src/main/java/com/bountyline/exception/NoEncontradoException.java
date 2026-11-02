package com.bountyline.exception;

/** El recurso pedido no existe (respuesta 404). */
public class NoEncontradoException extends RuntimeException {
    public NoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
