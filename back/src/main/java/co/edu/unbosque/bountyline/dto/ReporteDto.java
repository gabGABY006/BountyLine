package co.edu.unbosque.bountyline.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReporteDto(Long idReporte, Long idCuentaReporta, String aliasReporta, Long idCuentaReportada,
                         String aliasReportada, String idContenido, Long idAdministrador, String motivo,
                         String estado, LocalDateTime fechaReporte, LocalDateTime fechaResolucion) {

    public record Nuevo(Long idCuentaReportada, @Size(max = 24) String idContenido,
                        @NotBlank @Size(max = 300) String motivo) {
    }

    public record Resolucion(@NotBlank @Pattern(regexp = "RESUELTO|DESCARTADO") String estado,
                             Boolean suspender) {
    }
}
