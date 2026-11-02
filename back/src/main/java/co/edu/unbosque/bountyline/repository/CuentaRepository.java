package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CuentaRepository {

    /** Datos mínimos para validar el inicio de sesión. */
    public record Credenciales(Long idCuenta, String alias, String rol, String estado, String contrasenaHash) {
    }

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CuentaRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public Optional<Credenciales> buscarPorCorreo(String correo) {
        List<Credenciales> filas = jdbc.query(
                "SELECT id_cuenta, alias, rol, estado, contrasena_hash FROM cuenta WHERE correo = ?",
                (rs, i) -> new Credenciales(rs.getLong("id_cuenta"), rs.getString("alias"), rs.getString("rol"),
                        rs.getString("estado"), rs.getString("contrasena_hash")),
                correo);
        return filas.stream().findFirst();
    }

    /** sp_registrar_cuenta: cuenta + perfil + billetera en una sola transacción. */
    public Long registrar(String correo, String alias, String hash, String rol, String biografia,
                          Long idZona, String especialidadesJson) {
        return procedimientos.llamarConSalida("sp_registrar_cuenta",
                correo, alias, hash, rol, biografia, idZona, especialidadesJson);
    }
}
