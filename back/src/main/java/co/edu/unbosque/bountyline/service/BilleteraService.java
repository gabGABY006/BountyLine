package co.edu.unbosque.bountyline.service;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.BilleteraDto;
import co.edu.unbosque.bountyline.exception.NoEncontradoException;
import co.edu.unbosque.bountyline.repository.BilleteraRepository;

@Service
public class BilleteraService {

    private final BilleteraRepository billeteras;

    public BilleteraService(BilleteraRepository billeteras) {
        this.billeteras = billeteras;
    }

    public BilleteraDto buscarPorCuenta(Long idCuenta) {
        return billeteras.buscarPorCuenta(idCuenta).map(BilleteraDto::desde)
                .orElseThrow(() -> new NoEncontradoException("La cuenta no tiene billetera."));
    }

    public BilleteraDto recargar(Long idCuenta, BilleteraDto.Recarga recarga) {
        billeteras.recargar(idCuenta, recarga.monto());
        return buscarPorCuenta(idCuenta);
    }
}
