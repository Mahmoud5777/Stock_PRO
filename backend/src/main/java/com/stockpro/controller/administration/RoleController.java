package com.stockpro.controller.administration;

import com.stockpro.dto.administration.RoleDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.RoleService;
import com.stockpro.util.ExcelExporter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Rôles", description = "Gestion des rôles")
public class RoleController {

    private final RoleService roleService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<RoleDTO>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = (search == null || search.isBlank())
                ? roleService.findAll(pageable)
                : roleService.search(search, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<RoleDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.search(q, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<RoleDTO>> getAllUnpaged() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @Operation(summary = "Export roles (search) to Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String search) {
        List<RoleDTO> roles = (search == null || search.isBlank())
                ? roleService.findAll(Pageable.unpaged()).getContent()
                : roleService.search(search, Pageable.unpaged()).getContent();
        List<Object[]> rows = roles.stream()
                .map(r -> new Object[]{r.getCodeRole(), r.getLibelle(), r.getDescription()})
                .toList();
        return ExcelExporter.asResponse("roles.xlsx", "Roles",
                new String[]{"Code", "Name", "Description"}, rows);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(roleService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<RoleDTO> create(@Valid @RequestBody RoleDTO dto) {
        RoleDTO created = roleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> update(@PathVariable UUID id, @Valid @RequestBody RoleDTO dto) {
        return ResponseEntity.ok(roleService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}