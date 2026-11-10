package co.edu.unbosque.bountyline.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import co.edu.unbosque.bountyline.repository.CuentaRepository;

public class CuentaActivaValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error CUENTA_INACTIVA =
            new OAuth2Error("invalid_token", "La cuenta está suspendida o no existe.", null);

    private final CuentaRepository cuentas;

    public CuentaActivaValidator(CuentaRepository cuentas) {
        this.cuentas = cuentas;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        Long id;
        try {
            id = Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException e) {
            return OAuth2TokenValidatorResult.failure(CUENTA_INACTIVA);
        }
        boolean activa = cuentas.estado(id).map("ACTIVA"::equals).orElse(false);
        return activa ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(CUENTA_INACTIVA);
    }
}
