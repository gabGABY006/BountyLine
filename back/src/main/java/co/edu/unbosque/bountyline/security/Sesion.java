package co.edu.unbosque.bountyline.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;

public final class Sesion {

    public static final String USUARIO = "USUARIO";
    public static final String CAZARRECOMPENSAS = "CAZARRECOMPENSAS";
    public static final String ADMINISTRADOR = "ADMINISTRADOR";

    private Sesion() {
    }

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    public static String rol(Jwt jwt) {
        return jwt.getClaimAsString("rol");
    }

    public static boolean esAdministrador(Jwt jwt) {
        return ADMINISTRADOR.equals(rol(jwt));
    }

    public static void exigirPropiaOAdministrador(Jwt jwt, Long idCuenta) {
        if (!esAdministrador(jwt) && !id(jwt).equals(idCuenta)) {
            throw new AccessDeniedException("No tiene permiso para ver o modificar datos de otra cuenta.");
        }
    }
}
