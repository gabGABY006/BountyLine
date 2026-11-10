package co.edu.unbosque.bountyline.repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.BitacoraDto;

@Repository
public class BitacoraRepository {

    private final JdbcTemplate jdbc;

    public BitacoraRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<BitacoraDto> listar(String tipo, Long idCuenta, LocalDate desde, LocalDate hasta, int limite) {
        StringBuilder sql = new StringBuilder(
                "SELECT tipo, accion, fecha, id_cuenta, operador, referencia, id_mision, detalle FROM v_bitacora WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (tipo != null && !tipo.isBlank()) {
            sql.append(" AND tipo = ?");
            args.add(tipo);
        }
        if (idCuenta != null) {
            sql.append(" AND id_cuenta = ?");
            args.add(idCuenta);
        }
        if (desde != null) {
            sql.append(" AND fecha >= ?");
            args.add(desde.atStartOfDay());
        }
        if (hasta != null) {
            sql.append(" AND fecha < ?");
            args.add(hasta.plusDays(1).atStartOfDay());
        }
        sql.append(" ORDER BY fecha DESC, referencia DESC LIMIT ?");
        args.add(limite);
        return jdbc.query(sql.toString(),
                (rs, i) -> new BitacoraDto(rs.getString("tipo"), rs.getString("accion"),
                        Filas.fecha(rs, "fecha"), Filas.largo(rs, "id_cuenta"), rs.getString("operador"),
                        rs.getString("referencia"), Filas.largo(rs, "id_mision"), rs.getString("detalle")),
                args.toArray());
    }
}
