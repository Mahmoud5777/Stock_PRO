package com.stockpro.controller.audit;

import com.stockpro.dto.audit.LogAccesDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.audit.AuditAction;
import com.stockpro.mapper.audit.LogAccesMapper;
import com.stockpro.service.audit.AuditLogService;
import com.stockpro.util.ExcelExporter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Consultation des logs d'audit ("Logs" dans la matrice de droits du module Administration).
 * Protégé par le droit CONSULTATION sur la fonctionnalité ADMIN_AUDIT (voir AccessGuard).
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit / Logs", description = "Consultation des logs d'accès et d'authentification")
public class AuditLogController {

    private static final Map<AuditAction, String> ACTION_LABELS = Map.of(
            AuditAction.LOGIN_SUCCESS, "Successful login",
            AuditAction.LOGIN_FAILURE, "Failed login",
            AuditAction.LOGOUT, "Logout",
            AuditAction.REFRESH_TOKEN, "Token refresh",
            AuditAction.ACCES_API, "API call");

    private final AuditLogService auditLogService;
    private final LogAccesMapper mapper;

    @Operation(summary = "Lister les logs d'accès (paginé, filtrable par login et type d'action)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_AUDIT', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<LogAccesDTO>> getAll(
            @RequestParam(required = false) String login,
            @RequestParam(required = false) AuditAction action,
            @PageableDefault(size = 50, sort = "dateAcces", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        Page<LogAccesDTO> page = auditLogService.search(login, action, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Export access logs (search + filters) to Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_AUDIT', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String login,
            @RequestParam(required = false) AuditAction action) {
        List<LogAccesDTO> logs = auditLogService.search(login, action, Pageable.unpaged())
                .map(mapper::toDto)
                .getContent();
        List<Object[]> rows = logs.stream()
                .map(l -> new Object[]{
                        l.getDateAcces(),
                        l.getLogin(),
                        ACTION_LABELS.getOrDefault(l.getAction(), l.getAction() != null ? l.getAction().name() : ""),
                        l.getMethodeHttp(),
                        l.getEndpoint(),
                        l.getStatutHttp(),
                        l.getAdresseIp()
                })
                .toList();
        return ExcelExporter.asResponse("access-audit.xlsx", "Access Audit",
                new String[]{"Date & time", "User", "Event", "Method", "Endpoint", "Status", "IP Address"}, rows);
    }
}
