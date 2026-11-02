package co.edu.unbosque.bountyline.dto;

/** Perfil de administrador con los datos de su cuenta. */
public record AdministradorDto(Long idAdministrador, String alias, String correo, String estado, String nombre,
                               String nivelAcceso) {
}
