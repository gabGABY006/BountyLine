package co.edu.unbosque.bountyline.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.MisionDto;
import co.edu.unbosque.bountyline.model.Mision;

@Repository
public class MisionRepository {

    private static final String SELECT_DETALLE =
            "SELECT id_mision, titulo, descripcion, monto_recompensa, estado, fecha_publicacion, fecha_cierre, "
                    + "id_usuario, alias_usuario, id_zona, zona, id_especialidad, especialidad, "
                    + "id_cazarrecompensas, alias_cazarrecompensas, postulaciones FROM v_mision_detalle";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public MisionRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static MisionDto mapearDetalle(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new MisionDto(rs.getLong("id_mision"), rs.getString("titulo"), rs.getString("descripcion"),
                rs.getBigDecimal("monto_recompensa"), rs.getString("estado"),
                Filas.fecha(rs, "fecha_publicacion"), Filas.fecha(rs, "fecha_cierre"),
                rs.getLong("id_usuario"), rs.getString("alias_usuario"),
                rs.getLong("id_zona"), rs.getString("zona"),
                rs.getLong("id_especialidad"), rs.getString("especialidad"),
                Filas.largo(rs, "id_cazarrecompensas"), rs.getString("alias_cazarrecompensas"),
                Filas.entero(rs, "postulaciones"));
    }

    /** Filtros opcionales: estado, usuario que publicó y cazarrecompensas asignado. */
    public List<MisionDto> listarDetalle(String estado, Long idUsuario, Long idCazarrecompensas) {
        StringBuilder sql = new StringBuilder(SELECT_DETALLE).append(" WHERE 1 = 1");
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
        return jdbc.query(sql.toString(), MisionRepository::mapearDetalle, args.toArray());
    }

    public Optional<MisionDto> buscarDetalle(Long idMision) {
        return jdbc.query(SELECT_DETALLE + " WHERE id_mision = ?", MisionRepository::mapearDetalle, idMision)
                .stream().findFirst();
    }

    public Optional<Mision> buscarPorId(Long idMision) {
        return jdbc.query(
                "SELECT id_mision, id_usuario, id_zona, id_especialidad, id_cazarrecompensas, id_admin_cancela, "
                        + "titulo, descripcion, monto_recompensa, estado, fecha_publicacion, fecha_cierre "
                        + "FROM mision WHERE id_mision = ?",
                (rs, i) -> new Mision(rs.getLong("id_mision"), rs.getLong("id_usuario"), rs.getLong("id_zona"),
                        rs.getLong("id_especialidad"), Filas.largo(rs, "id_cazarrecompensas"),
                        Filas.largo(rs, "id_admin_cancela"), rs.getString("titulo"), rs.getString("descripcion"),
                        rs.getBigDecimal("monto_recompensa"), rs.getString("estado"),
                        Filas.fecha(rs, "fecha_publicacion"), Filas.fecha(rs, "fecha_cierre")),
                idMision).stream().findFirst();
    }

    public List<MisionDto.Sugerencia> sugerencias(Long idMision, int limite) {
        return jdbc.query("CALL sp_sugerir_cazarrecompensas(?, ?)",
                (rs, i) -> new MisionDto.Sugerencia(rs.getLong("id_cazarrecompensas"), rs.getString("alias"),
                        rs.getString("zona"), rs.getBigDecimal("reputacion"),
                        rs.getInt("misiones_completadas"), rs.getInt("puntaje")),
                idMision, limite);
    }

    public Long publicar(MisionDto.Nueva m) {
        return procedimientos.llamarConSalida("sp_publicar_mision",
                m.idUsuario(), m.idZona(), m.idEspecialidad(), m.titulo(), m.descripcion(), m.monto());
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
}
