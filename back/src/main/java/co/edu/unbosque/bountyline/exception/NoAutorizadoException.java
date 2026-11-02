package co.edu.unbosque.bountyline.exception;

/** Credenciales incorrectas o cuenta sin acceso (HTTP 401). */
public class NoAutorizadoException extends RuntimeException {

    public NoAutorizadoException(String mensaje) {
        super(mensaje);
    }
}
