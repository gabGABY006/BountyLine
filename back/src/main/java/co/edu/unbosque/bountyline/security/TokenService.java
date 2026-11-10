package co.edu.unbosque.bountyline.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.model.Cuenta;

@Service
public class TokenService {

    private final JwtEncoder encoder;
    private final long horas;

    public TokenService(JwtEncoder encoder, @Value("${bountyline.jwt.horas}") long horas) {
        this.encoder = encoder;
        this.horas = horas;
    }

    public String generar(Cuenta cuenta) {
        Instant ahora = Instant.now();
        JwtClaimsSet datos = JwtClaimsSet.builder()
                .issuer("bountyline")
                .issuedAt(ahora)
                .expiresAt(ahora.plus(horas, ChronoUnit.HOURS))
                .subject(String.valueOf(cuenta.getIdCuenta()))
                .claim("rol", cuenta.getRol())
                .claim("alias", cuenta.getAlias())
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(cabecera, datos)).getTokenValue();
    }

    public Instant expiracion() {
        return Instant.now().plus(horas, ChronoUnit.HOURS);
    }
}
