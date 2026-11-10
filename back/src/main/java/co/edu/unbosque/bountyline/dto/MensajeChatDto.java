package co.edu.unbosque.bountyline.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MensajeChatDto(String id, Long idMision, Long idEmisor, String aliasEmisor, String rolEmisor,
                             String texto, Instant fecha, Boolean leido) {

    public record Nuevo(@NotBlank @Size(max = 1000) String texto) {
    }
}
