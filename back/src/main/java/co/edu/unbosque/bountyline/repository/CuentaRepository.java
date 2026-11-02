package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.model.Cuenta;

@Repository
public class CuentaRepository {

    private static final String SELECT =
            "SELECT id_cuenta, correo, alias, contrasena_hash, rol, estado, fecha_registro FROM cuenta";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CuentaRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static Cuenta mapear(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new Cuenta(rs.getLong("id_cuenta"), rs.getString("correo"), rs.getString("alias"),
                rs.getString("contrasena_hash"), rs.getString("rol"), rs.getString("estado"),
                Filas.fecha(rs, "fecha_registro"));
    }

    public List<Cuenta> listar(String rol, String estado) {
        StringBuilder sql = new StringBuilder(SELECT).append(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (rol != null && !rol.isBlank()) {
            sql.append(" AND rol = ?");
            args.add(rol);
        }
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND estado = ?");
            args.add(estado);
        }
        sql.append(" ORDER BY id_cuenta");
        return jdbc.query(sql.toString(), CuentaRepository::mapear, args.toArray());
    }

    public Optional<Cuenta> buscarPorId(Long idCuenta) {
        return jdbc.query(SELECT + " WHERE id_cuenta = ?", CuentaRepository::mapear, idCuenta).stream().findFirst();
    }

    public Optional<Cuenta> buscarPorCorreo(String correo) {
        return jdbc.query(SELECT + " WHERE correo = ?", CuentaRepository::mapear, correo).stream().findFirst();
    }

    /** sp_registrar_cuenta: cuenta + perfil + billetera en una sola transacción. */
    public Long registrar(String correo, String alias, String hash, String rol, String biografia,
                          Long idZona, String especialidadesJson) {
        return procedimientos.llamarConSalida("sp_registrar_cuenta",
                correo, alias, hash, rol, biografia, idZona, especialidadesJson);
    }

    public void cambiarCorreo(Long idCuenta, String correo) {
        procedimientos.llamar("sp_cambiar_correo", idCuenta, correo);
    }

    public void cambiarEstado(Long idAdministrador, Long idCuenta, String estado) {
        procedimientos.llamar("sp_cambiar_estado_cuenta", idAdministrador, idCuenta, estado);
    }
}
