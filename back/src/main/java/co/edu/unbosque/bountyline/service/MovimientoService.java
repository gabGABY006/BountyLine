package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.MovimientoDto;
import co.edu.unbosque.bountyline.repository.MovimientoRepository;

@Service
public class MovimientoService {

    private static final int LIMITE_MAXIMO = 500;

    private final MovimientoRepository movimientos;

    public MovimientoService(MovimientoRepository movimientos) {
        this.movimientos = movimientos;
    }

    public List<MovimientoDto> listar(Long idCuenta, Long idMision, int limite) {
        int tope = Math.max(1, Math.min(limite, LIMITE_MAXIMO));
        return movimientos.listar(idCuenta, idMision, tope).stream().map(MovimientoDto::desde).toList();
    }
}
