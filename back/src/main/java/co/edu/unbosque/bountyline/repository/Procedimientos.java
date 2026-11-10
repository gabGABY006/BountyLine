package co.edu.unbosque.bountyline.repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Collections;

import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class Procedimientos {

    private final JdbcTemplate jdbc;

    public Procedimientos(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void llamar(String procedimiento, Object... argumentos) {
        String sql = "CALL " + procedimiento + "(" + marcadores(argumentos.length) + ")";
        jdbc.execute((ConnectionCallback<Void>) con -> {
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                asignar(ps, argumentos);
                ps.execute();
            }
            return null;
        });
    }

    public Long llamarConSalida(String procedimiento, Object... argumentos) {
        String lista = argumentos.length == 0 ? "@salida" : marcadores(argumentos.length) + ", @salida";
        String sql = "CALL " + procedimiento + "(" + lista + ")";
        return jdbc.execute((ConnectionCallback<Long>) con -> {
            try (PreparedStatement limpiar = con.prepareStatement("SET @salida = NULL")) {
                limpiar.execute();
            }
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                asignar(ps, argumentos);
                ps.execute();
            }
            try (PreparedStatement leer = con.prepareStatement("SELECT @salida");
                 ResultSet rs = leer.executeQuery()) {
                if (rs.next()) {
                    long valor = rs.getLong(1);
                    return rs.wasNull() ? null : valor;
                }
                return null;
            }
        });
    }

    private static String marcadores(int cantidad) {
        return String.join(", ", Collections.nCopies(cantidad, "?"));
    }

    private static void asignar(PreparedStatement ps, Object[] argumentos) throws java.sql.SQLException {
        for (int i = 0; i < argumentos.length; i++) {
            ps.setObject(i + 1, argumentos[i]);
        }
    }
}
