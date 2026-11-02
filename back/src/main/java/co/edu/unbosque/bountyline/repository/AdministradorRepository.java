package co.edu.unbosque.bountyline.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.bountyline.dto.AdministradorDto;

@Repository
public class AdministradorRepository {

    private static final String SELECT_DETALLE =
            "SELECT a.id_administrador, c.alias, c.correo, c.estado, a.nombre, a.nivel_acceso "
                    + "FROM administrador a JOIN cuenta c ON c.id_cuenta = a.id_administrador";

    private final JdbcTemplate jdbc;

    public AdministradorRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static AdministradorDto mapear(java.sql.ResultSet rs, int fila) throws java.sql.SQLException {
        return new AdministradorDto(rs.getLong("id_administrador"), rs.getString("alias"), rs.getString("correo"),
                rs.getString("estado"), rs.getString("nombre"), rs.getString("nivel_acceso"));
    }

    public List<AdministradorDto> listar() {
        return jdbc.query(SELECT_DETALLE + " ORDER BY a.nombre", AdministradorRepository::mapear);
    }

    public Optional<AdministradorDto> buscar(Long idAdministrador) {
        return jdbc.query(SELECT_DETALLE + " WHERE a.id_administrador = ?", AdministradorRepository::mapear,
                idAdministrador).stream().findFirst();
    }
}
