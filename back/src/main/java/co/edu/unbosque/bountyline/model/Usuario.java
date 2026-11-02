package co.edu.unbosque.bountyline.model;

/** Tabla usuario: Perfil del jugador que publica misiones. */
public class Usuario {

    private Long idUsuario;
    private String biografia;

    public Usuario() {
    }

    public Usuario(Long idUsuario, String biografia) {
        this.idUsuario = idUsuario;
        this.biografia = biografia;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }
}
