package co.edu.unbosque.bountyline.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.BitacoraDto;
import co.edu.unbosque.bountyline.exception.ReglaNegocioException;
import co.edu.unbosque.bountyline.repository.BitacoraRepository;

@Service
public class BitacoraService {

    private static final Set<String> TIPOS = Set.of("PAGO", "MISION", "REPORTE", "CUENTA");

    private final BitacoraRepository bitacora;

    public BitacoraService(BitacoraRepository bitacora) {
        this.bitacora = bitacora;
    }

    public List<BitacoraDto> listar(String tipo, Long idCuenta, LocalDate desde, LocalDate hasta, int limite) {
        if (tipo != null && !tipo.isBlank() && !TIPOS.contains(tipo)) {
            throw new ReglaNegocioException("El tipo debe ser PAGO, MISION, REPORTE o CUENTA.");
        }
        if (desde != null && hasta != null && hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha final no puede ser anterior a la inicial.");
        }
        return bitacora.listar(tipo, idCuenta, desde, hasta, Math.max(1, Math.min(limite, 500)));
    }
}
