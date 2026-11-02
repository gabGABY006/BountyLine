package com.bountyline.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bountyline.dto.CazarrecompensasDto;
import com.bountyline.repository.CazarrecompensasRepository;

@RestController
@RequestMapping("/api/cazarrecompensas")
public class CazarrecompensasController {

    private final CazarrecompensasRepository cazarrecompensas;

    public CazarrecompensasController(CazarrecompensasRepository cazarrecompensas) {
        this.cazarrecompensas = cazarrecompensas;
    }

    /** Búsqueda manual con filtros (RF-06). */
    @GetMapping
    public List<CazarrecompensasDto> listar(@RequestParam(required = false) Long idZona,
                                            @RequestParam(required = false) String disponibilidad) {
        return cazarrecompensas.listar(idZona, disponibilidad);
    }
}
