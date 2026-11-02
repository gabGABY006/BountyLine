package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.PostulacionDto;
import co.edu.unbosque.bountyline.repository.PostulacionRepository;

@Service
public class PostulacionService {

    private final PostulacionRepository postulaciones;

    public PostulacionService(PostulacionRepository postulaciones) {
        this.postulaciones = postulaciones;
    }

    public List<PostulacionDto> listar(Long idMision, Long idCazarrecompensas) {
        return postulaciones.listar(idMision, idCazarrecompensas);
    }

    public List<PostulacionDto> postular(PostulacionDto.Nueva p) {
        postulaciones.postular(p.idMision(), p.idCazarrecompensas(), p.mensaje());
        return postulaciones.listar(p.idMision(), null);
    }
}
