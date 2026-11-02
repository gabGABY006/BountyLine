package co.edu.unbosque.bountyline.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Comprueba que la API está arriba y que llega a MySQL. */
@RestController
@RequestMapping("/api/salud")
public class SaludController {

    private final JdbcTemplate jdbc;

    public SaludController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public Map<String, Object> salud() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("api", "OK");
        r.put("mysql", jdbc.queryForObject("SELECT VERSION()", String.class));
        r.put("cuentas", jdbc.queryForObject("SELECT COUNT(*) FROM cuenta", Long.class));
        return r;
    }
}
