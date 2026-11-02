package com.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class ReporteDtos {

    private ReporteDtos() {
    }

    public record Reporte(Long idReporte, Long idCuentaReporta, String aliasReporta, Long idCuentaReportada,
                          String aliasReportada, String idContenido, Long idAdministrador, String motivo,
                          String estado, LocalDateTime fechaReporte, LocalDateTime fechaResolucion) {
    }

    /** Debe indicar idCuentaReportada o idContenido, no ambos (supuesto S72). */
    public record NuevoReporte(@NotNull Long idCuentaReporta, Long idCuentaReportada,
                               @Size(max = 24) String idContenido, @NotBlank @Size(max = 300) String motivo) {
    }

    public record Resolucion(@NotNull Long idAdministrador,
                             @NotBlank @Pattern(regexp = "RESUELTO|DESCARTADO") String estado,
                             boolean suspender) {
    }
}
