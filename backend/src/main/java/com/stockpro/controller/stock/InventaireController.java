package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.InventaireCreateDTO;
import com.stockpro.dto.stock.InventaireDTO;
import com.stockpro.dto.stock.InventaireLigneSaisieDTO;
import com.stockpro.entity.stock.StatutInventaire;
import com.stockpro.service.stock.InventaireService;
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
@RequestMapping("/api/inventaires")
@RequiredArgsConstructor
public class InventaireController {

    private final InventaireService inventaireService;

    @GetMapping
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<InventaireDTO>> findAll(
            @RequestParam(required = false) UUID idSite,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StatutInventaire statut,
            Pageable pageable) {
        return ResponseEntity.ok(PageResponseDTO.of(inventaireService.findAll(idSite, search, statut, pageable)));
    }

    @Operation(summary = "Export inventories (search + filters) to Excel (.xlsx)")
    @GetMapping("/export")
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'EXPORT')")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) UUID idSite,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StatutInventaire statut) {
        List<InventaireDTO> inventaires = inventaireService.findAll(idSite, search, statut, Pageable.unpaged()).getContent();
        List<Object[]> rows = inventaires.stream()
                .map(i -> new Object[]{i.getCodeInventaire(), i.getNomSite(), i.getNomResponsable(), i.getStatut(), i.getDateInventaire(), i.getDateCloture()})
                .toList();
        return ExcelExporter.asResponse("inventory.xlsx", "Inventory",
                new String[]{"Code", "Site", "Manager", "Status", "Opened on", "Closed on"}, rows);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'CONSULTATION')")
    public ResponseEntity<InventaireDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(inventaireService.findById(id));
    }

    @PostMapping
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'AJOUT')")
    public ResponseEntity<InventaireDTO> create(@Valid @RequestBody InventaireCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventaireService.create(dto));
    }

    @PutMapping("/{idInventaire}/lignes/{idLigne}")
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'MODIFICATION')")
    public ResponseEntity<InventaireDTO> saisirLigne(
            @PathVariable UUID idInventaire,
            @PathVariable UUID idLigne,
            @Valid @RequestBody InventaireLigneSaisieDTO dto) {
        return ResponseEntity.ok(inventaireService.saisirLigne(idInventaire, idLigne, dto));
    }

    @PostMapping("/{id}/cloturer")
    @PreAuthorize("@accessGuard.can(authentication, 'INVENTAIRE', 'MODIFICATION')")
    public ResponseEntity<InventaireDTO> cloturer(@PathVariable UUID id) {
        return ResponseEntity.ok(inventaireService.cloturer(id));
    }
}
