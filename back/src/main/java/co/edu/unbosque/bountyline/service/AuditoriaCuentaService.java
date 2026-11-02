package co.edu.unbosque.bountyline.service;

import java.util.List;

import org.springframework.stereotype.Service;

import co.edu.unbosque.bountyline.dto.AuditoriaCuentaDto;
import co.edu.unbosque.bountyline.repository.AuditoriaCuentaRepository;

@Service
public class AuditoriaCuentaService {

    private final AuditoriaCuentaRepository auditoria;

    public AuditoriaCuentaService(AuditoriaCuentaRepository auditoria) {
        this.auditoria = auditoria;
    }

    public List<AuditoriaCuentaDto> listar(Long idCuenta) {
        return auditoria.listar(idCuenta).stream().map(AuditoriaCuentaDto::desde).toList();
    }
}
