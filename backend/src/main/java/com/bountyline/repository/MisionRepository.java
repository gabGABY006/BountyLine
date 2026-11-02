package com.bountyline.repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.bountyline.dto.MisionDtos;

@Repository
public class MisionRepository {

    private static final String SELECT_MISION =
            "SELECT id_mision, titulo, descripcion, monto_recompensa, estado, fecha_publicacion, fecha_cierre, "
                    + "id_usuario, alias_usuario, id_zona, zona, id_especialidad, especialidad, "
                    + "id_cazarrecompensas, alias_cazarrecompensas, postulaciones FROM v_mision_detalle";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public MisionRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static MisionDtos.Mision mapear(ResultSet rs, int fila) throws SQLException {
        return new MisionDtos.Mision(rs.getLong("id_mision"), rs.getString("titulo"), rs.getString("descripcion"),
                rs.getBigDecimal("monto_recompensa"), rs.getString("estado"),
                Filas.fecha(rs, "fecha_publicacion"), Filas.fecha(rs, "fecha_cierre"),
                rs.getLong("id_usuario"), rs.getString("alias_usuario"),
                rs.getLong("id_zona"), rs.getString("zona"),
                rs.getLong("id_especialidad"), rs.getString("especialidad"),
                Filas.largo(rs, "id_cazarrecompensas"), rs.getString("alias_cazarrecompensas"),
                Filas.entero(rs, "postulaciones"));
    }

    /** Filtros opcionales: estado, usuario que publicó y cazarrecompensas asignado. */
    public List<MisionDtos.Mision> listar(String estado, Long idUsuario, Long idCazarrecompensas) {
        StringBuilder sql = new StringBuilder(SELECT_MISION).append(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND estado = ?");
            args.add(estado);
        }
        if (idUsuario != null) {
            sql.append(" AND id_usuario = ?");
            args.add(idUsuario);
        }
        if (idCazarrecompensas != null) {
            sql.append(" AND id_cazarrecompensas = ?");
            args.add(idCazarrecompensas);
        }
        sql.append(" ORDER BY fecha_publicacion DESC, id_mision DESC");
        return jdbc.query(sql.toString(), MisionRepository::mapear, args.toArray());
    }

    public Optional<MisionDtos.Mision> buscar(Long idMision) {
        return jdbc.query(SELECT_MISION + " WHERE id_mision = ?", MisionRepository::mapear, idMision)
                .stream().findFirst();
    }

    public List<MisionDtos.Postulacion> postulaciones(Long idMision) {
        return jdbc.query(
                "SELECT p.id_cazarrecompensas, c.alias, p.fecha_postulacion, p.mensaje, p.estado_postulacion, "
                        + "fn_puntaje_match(p.id_cazarrecompensas, p.id_mision) AS puntaje "
                        + "FROM postulacion p JOIN cuenta c ON c.id_cuenta = p.id_cazarrecompensas "
                        + "WHERE p.id_mision = ? ORDER BY puntaje DESC",
                (rs, i) -> new MisionDtos.Postulacion(rs.getLong("id_cazarrecompensas"), rs.getString("alias"),
                        Filas.fecha(rs, "fecha_postulacion"), rs.getString("mensaje"),
                        rs.getString("estado_postulacion"), rs.getInt("puntaje")),
                idMision);
    }

    public List<MisionDtos.Sugerencia> sugerencias(Long idMision, int limite) {
        return jdbc.query("CALL sp_sugerir_cazarrecompensas(?, ?)",
                (rs, i) -> new MisionDtos.Sugerencia(rs.getLong("id_cazarrecompensas"), rs.getString("alias"),
                        rs.getString("zona"), rs.getBigDecimal("reputacion"),
                        rs.getInt("misiones_completadas"), rs.getInt("puntaje")),
                idMision, limite);
    }

    public Long publicar(MisionDtos.NuevaMision m) {
        return procedimientos.llamarConSalida("sp_publicar_mision",
                m.idUsuario(), m.idZona(), m.idEspecialidad(), m.titulo(), m.descripcion(), m.monto());
    }

    public void postular(Long idMision, Long idCazarrecompensas, String mensaje) {
        procedimientos.llamar("sp_postular", idMision, idCazarrecompensas, mensaje);
    }

    public void asignar(Long idMision, Long idUsuario, Long idCazarrecompensas) {
        procedimientos.llamar("sp_asignar_cazarrecompensas", idMision, idUsuario, idCazarrecompensas);
    }

    public void iniciar(Long idMision, Long idCazarrecompensas) {
        procedimientos.llamar("sp_iniciar_mision", idMision, idCazarrecompensas);
    }

    public void cerrar(Long idMision, Long idUsuario) {
        procedimientos.llamar("sp_cerrar_mision", idMision, idUsuario);
    }

    public void cancelar(Long idMision, Long idUsuario, Long idAdministrador) {
        procedimientos.llamar("sp_cancelar_mision", idMision, idUsuario, idAdministrador);
    }

    public void calificar(Long idMision, Long idUsuario, Integer puntaje, String comentario) {
        procedimientos.llamar("sp_calificar_mision", idMision, idUsuario, puntaje, comentario);
    }

    public BigDecimal montoRetenidoTotal() {
        return jdbc.queryForObject("SELECT IFNULL(SUM(saldo_retenido), 0) FROM billetera", BigDecimal.class);
    }
}
