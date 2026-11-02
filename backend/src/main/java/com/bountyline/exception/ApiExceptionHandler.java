package com.bountyline.exception;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convierte los errores en respuestas JSON con un mensaje claro.
 * Los procedimientos almacenados rechazan las reglas de negocio con
 * SIGNAL SQLSTATE '45000'; ese mensaje se devuelve tal cual al cliente.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final String ESTADO_REGLA_NEGOCIO = "45000";

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> baseDeDatos(DataAccessException ex) {
        SQLException sql = buscarSqlException(ex);
        if (sql != null && ESTADO_REGLA_NEGOCIO.equals(sql.getSQLState())) {
            return respuesta(HttpStatus.BAD_REQUEST, sql.getMessage());
        }
        if (sql != null && sql.getErrorCode() == 1062) {
            return respuesta(HttpStatus.CONFLICT, "Ya existe un registro con esos datos.");
        }
        if (sql != null && (sql.getErrorCode() == 1452 || sql.getErrorCode() == 3819)) {
            return respuesta(HttpStatus.BAD_REQUEST, "Los datos no cumplen las reglas de integridad: " + sql.getMessage());
        }
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Error de base de datos.");
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, Object>> reglaNegocio(ReglaNegocioException ex) {
        return respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(NoEncontradoException ex) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex) {
        String detalle = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return respuesta(HttpStatus.BAD_REQUEST, detalle);
    }

    private static SQLException buscarSqlException(Throwable ex) {
        Throwable actual = ex;
        while (actual != null) {
            if (actual instanceof SQLException sql) {
                return sql;
            }
            actual = actual.getCause();
        }
        return null;
    }

    private static ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("fecha", LocalDateTime.now().toString());
        cuerpo.put("estado", estado.value());
        cuerpo.put("error", mensaje);
        return ResponseEntity.status(estado).body(cuerpo);
    }
}
