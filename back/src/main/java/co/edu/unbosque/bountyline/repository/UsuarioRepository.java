package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.UsuarioDto;
import co.edu.unbosque.bountyline.model.Usuario;

@Repository
public class UsuarioRepository {

    private static final String SELECT_DETALLE =
            "SELECT u.id_usuario, c.alias, c.correo, c.estado, u.biografia, "
                    + "(SELECT COUNT(*) FROM mision m WHERE m.id_usuario = u.id_usuario) AS misiones_publicadas "
                    + "FROM usuario u JOIN cuenta c ON c.id_cuenta = u.id_usuario";

    private final JdbcTemplate jdbc;
    private final Procedimientos procedimientos;

    public UsuarioRepository(JdbcTemplate jdbc, Procedimientos procedimientos) {
        this.jdbc = jdbc;
        this.procedimientos = procedimientos;
    }

    private static UsuarioDto mapearDetalle(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new UsuarioDto(rs.getLong("id_usuario"), rs.getString("alias"), rs.getString("correo"),
                rs.getString("estado"), rs.getString("biografia"), rs.getInt("misiones_publicadas"));
    }

    public List<UsuarioDto> listarDetalle() {
        return jdbc.query(SELECT_DETALLE + " ORDER BY c.alias", UsuarioRepository::mapearDetalle);
    }

    public Optional<UsuarioDto> buscarDetalle(Long idUsuario) {
        return jdbc.query(SELECT_DETALLE + " WHERE u.id_usuario = ?", UsuarioRepository::mapearDetalle, idUsuario)
                .stream().findFirst();
    }

    public Optional<Usuario> buscarPorId(Long idUsuario) {
        return jdbc.query("SELECT id_usuario, biografia FROM usuario WHERE id_usuario = ?",
                (rs, i) -> new Usuario(rs.getLong("id_usuario"), rs.getString("biografia")), idUsuario)
                .stream().findFirst();
    }

    public void actualizar(Long idUsuario, String biografia) {
        procedimientos.llamar("sp_actualizar_usuario", idUsuario, biografia);
    }
}
