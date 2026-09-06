package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.MouvementCreateDTO;
import com.stockpro.dto.stock.MouvementStockDTO;
import com.stockpro.service.stock.MouvementStockService;
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
@RequestMapping("/api/mouvements-stock")
@RequiredArgsConstructor
public class MouvementStockController {

    private final MouvementStockService mouvementService;

    @GetMapping("/entrees")
    @PreAuthorize("@accessGuard.can(authentication, 'ENTREES_STOCK', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<MouvementStockDTO>> findEntrees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idSite,
            Pageable pageable) {
        return ResponseEntity.ok(PageResponseDTO.of(mouvementService.findEntrees(search, idSite, pageable)));
    }

    @Operation(summary = "Export stock-in movements (search + filters) to Excel (.xlsx)")
    @GetMapping("/entrees/export")
    @PreAuthorize("@accessGuard.can(authentication, 'ENTREES_STOCK', 'EXPORT')")
    public ResponseEntity<byte[]> exportEntrees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idSite) {
        List<MouvementStockDTO> rows = mouvementService.findEntrees(search, idSite, Pageable.unpaged()).getContent();
        return ExcelExporter.asResponse("stock-in.xlsx", "Stock In",
                new String[]{"Date", "Article", "Site", "Quantity", "Reference", "Reason", "Recorded by"},
                toRows(rows));
    }

    @PostMapping("/entrees")
    @PreAuthorize("@accessGuard.can(authentication, 'ENTREES_STOCK', 'AJOUT')")
    public ResponseEntity<MouvementStockDTO> enregistrerEntree(@Valid @RequestBody MouvementCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mouvementService.enregistrerEntree(dto));
    }

    @GetMapping("/sorties")
    @PreAuthorize("@accessGuard.can(authentication, 'SORTIES_STOCK', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<MouvementStockDTO>> findSorties(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idSite,
            Pageable pageable) {
        return ResponseEntity.ok(PageResponseDTO.of(mouvementService.findSorties(search, idSite, pageable)));
    }

    @Operation(summary = "Export stock-out movements (search + filters) to Excel (.xlsx)")
    @GetMapping("/sorties/export")
    @PreAuthorize("@accessGuard.can(authentication, 'SORTIES_STOCK', 'EXPORT')")
    public ResponseEntity<byte[]> exportSorties(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idSite) {
        List<MouvementStockDTO> rows = mouvementService.findSorties(search, idSite, Pageable.unpaged()).getContent();
        return ExcelExporter.asResponse("stock-out.xlsx", "Stock Out",
                new String[]{"Date", "Article", "Site", "Quantity", "Reference", "Reason", "Recorded by"},
                toRows(rows));
    }

    @PostMapping("/sorties")
    @PreAuthorize("@accessGuard.can(authentication, 'SORTIES_STOCK', 'AJOUT')")
    public ResponseEntity<MouvementStockDTO> enregistrerSortie(@Valid @RequestBody MouvementCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mouvementService.enregistrerSortie(dto));
    }

    @GetMapping("/recents")
    @PreAuthorize("@accessGuard.can(authentication, 'RAPPORTS', 'CONSULTATION')")
    public ResponseEntity<List<MouvementStockDTO>> derniersMouvements() {
        return ResponseEntity.ok(mouvementService.findDerniersMouvements());
    }

    private List<Object[]> toRows(List<MouvementStockDTO> mouvements) {
        return mouvements.stream()
                .map(m -> new Object[]{
                        m.getDateMouvement(),
                        m.getCodeArticle() + " — " + m.getNomArticle(),
                        m.getNomSite(),
                        m.getQuantite(),
                        m.getReferenceDoc(),
                        m.getMotif(),
                        m.getNomUtilisateur()
                })
                .toList();
    }
}
