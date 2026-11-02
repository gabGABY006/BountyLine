package com.bountyline.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.bountyline.dto.CatalogoDtos;

@Repository
public class CatalogoRepository {

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public CatalogoRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    public List<CatalogoDtos.Zona> zonas() {
        return jdbc.query("SELECT id_zona, nombre, descripcion, nivel_peligro FROM zona ORDER BY nombre",
                (rs, i) -> new CatalogoDtos.Zona(rs.getLong("id_zona"), rs.getString("nombre"),
                        rs.getString("descripcion"), rs.getInt("nivel_peligro")));
    }

    public List<CatalogoDtos.Especialidad> especialidades() {
        return jdbc.query("SELECT id_especialidad, nombre, descripcion FROM especialidad ORDER BY nombre",
                (rs, i) -> new CatalogoDtos.Especialidad(rs.getLong("id_especialidad"), rs.getString("nombre"),
                        rs.getString("descripcion")));
    }

    public Long crearZona(CatalogoDtos.NuevaZona z) {
        return procedimientos.llamarConSalida("sp_crear_zona",
                z.idAdministrador(), z.nombre(), z.descripcion(), z.nivelPeligro());
    }

    public Long crearEspecialidad(CatalogoDtos.NuevaEspecialidad e) {
        return procedimientos.llamarConSalida("sp_crear_especialidad",
                e.idAdministrador(), e.nombre(), e.descripcion());
    }
}
