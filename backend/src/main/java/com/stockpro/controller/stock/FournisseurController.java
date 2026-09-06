package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.FournisseurDTO;
import com.stockpro.service.stock.FournisseurService;
import com.stockpro.util.ExcelExporter;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fournisseurs")
@RequiredArgsConstructor
public class FournisseurController {

    private final FournisseurService fournisseurService;

    @GetMapping("/all")
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'CONSULTATION')")
    public ResponseEntity<List<FournisseurDTO>> findAll() {
        return ResponseEntity.ok(fournisseurService.findAll());
    }

    @GetMapping
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<FournisseurDTO>> findAll(
            @RequestParam(required = false) String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? fournisseurService.findAll(pageable)
                : fournisseurService.search(search, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Export suppliers (search) to Excel (.xlsx)")
    @GetMapping("/export")
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'EXPORT')")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String search) {
        List<FournisseurDTO> fournisseurs = (search == null || search.isBlank())
                ? fournisseurService.findAll(Pageable.unpaged()).getContent()
                : fournisseurService.search(search, Pageable.unpaged()).getContent();
        List<Object[]> rows = fournisseurs.stream()
                .map(f -> new Object[]{f.getCodeFournisseur(), f.getNomFournisseur(), f.getContact(), f.getTelephone(), f.getEmail(), f.getAdresse()})
                .toList();
        return ExcelExporter.asResponse("suppliers.xlsx", "Suppliers",
                new String[]{"Code", "Name", "Contact", "Phone", "Email", "Address"}, rows);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'CONSULTATION')")
    public ResponseEntity<FournisseurDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(fournisseurService.findById(id));
    }

    @PostMapping
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'AJOUT')")
    public ResponseEntity<FournisseurDTO> create(@Valid @RequestBody FournisseurDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fournisseurService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'MODIFICATION')")
    public ResponseEntity<FournisseurDTO> update(@PathVariable UUID id, @Valid @RequestBody FournisseurDTO dto) {
        return ResponseEntity.ok(fournisseurService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'FOURNISSEURS', 'SUPPRESSION')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        fournisseurService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
