package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Cuenta;

@Repository
public class CuentaRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CuentaRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public Optional<Cuenta> buscarPorCorreo(String correo) {
        List<Cuenta> filas = jdbc.query(
                "SELECT id_cuenta, correo, alias, contrasena_hash, rol, estado, fecha_registro FROM cuenta WHERE correo = ?",
                (rs, i) -> new Cuenta(rs.getLong("id_cuenta"), rs.getString("correo"), rs.getString("alias"),
                        rs.getString("contrasena_hash"), rs.getString("rol"), rs.getString("estado"),
                        Filas.fecha(rs, "fecha_registro")),
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
