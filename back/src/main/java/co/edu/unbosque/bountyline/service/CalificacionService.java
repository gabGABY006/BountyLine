package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.CalificacionDto;
import co.edu.unbosque.bountyline.repository.CalificacionRepository;

@Service
public class CalificacionService {

    private final CalificacionRepository calificaciones;

    public CalificacionService(CalificacionRepository calificaciones) {
        this.calificaciones = calificaciones;
    }

    public List<CalificacionDto> listar(Long idMision, Long idCazarrecompensas) {
        return calificaciones.listar(idMision, idCazarrecompensas);
    }

    public List<CalificacionDto> calificar(Long idUsuario, CalificacionDto.Nueva c) {
        calificaciones.calificar(c.idMision(), idUsuario, c.puntaje(), c.comentario());
        return calificaciones.listar(c.idMision(), null);
    }
}
