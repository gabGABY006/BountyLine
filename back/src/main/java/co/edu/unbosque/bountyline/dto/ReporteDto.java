package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReporteDto(Long idReporte, Long idCuentaReporta, String aliasReporta, Long idCuentaReportada,
                         String aliasReportada, String idContenido, Long idAdministrador, String motivo,
                         String estado, LocalDateTime fechaReporte, LocalDateTime fechaResolucion) {

    /** Debe indicar idCuentaReportada o idContenido, no ambos (S72). */
    public record Nuevo(@NotNull Long idCuentaReporta, Long idCuentaReportada, @Size(max = 24) String idContenido,
                        @NotBlank @Size(max = 300) String motivo) {
    }

    public record Resolucion(@NotNull Long idAdministrador,
                             @NotBlank @Pattern(regexp = "RESUELTO|DESCARTADO") String estado,
                             Boolean suspender) {
    }
}
