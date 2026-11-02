package com.bountyline.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

/** Lectura de columnas que pueden venir en NULL. */
final class Filas {

    private Filas() {
    }

    static Long largo(ResultSet rs, String columna) throws SQLException {
        long valor = rs.getLong(columna);
        return rs.wasNull() ? null : valor;
    }

    static Integer entero(ResultSet rs, String columna) throws SQLException {
        int valor = rs.getInt(columna);
        return rs.wasNull() ? null : valor;
    }

    static LocalDateTime fecha(ResultSet rs, String columna) throws SQLException {
        return rs.getObject(columna, LocalDateTime.class);
    }
}
