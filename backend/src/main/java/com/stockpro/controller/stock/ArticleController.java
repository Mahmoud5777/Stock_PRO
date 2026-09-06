package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.ArticleDTO;
import com.stockpro.dto.stock.StockSiteDTO;
import com.stockpro.service.stock.ArticleService;
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
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping("/all")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'CONSULTATION')")
    public ResponseEntity<List<ArticleDTO>> findAll() {
        return ResponseEntity.ok(articleService.findAll());
    }

    @GetMapping
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<ArticleDTO>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idCategorie,
            @RequestParam(required = false) UUID idFournisseur,
            @RequestParam(required = false) Boolean actif,
            Pageable pageable) {
        var page = articleService.search(search, idCategorie, idFournisseur, actif, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Export articles (search + filters) to Excel (.xlsx)")
    @GetMapping("/export")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'EXPORT')")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID idCategorie,
            @RequestParam(required = false) UUID idFournisseur,
            @RequestParam(required = false) Boolean actif) {
        List<ArticleDTO> articles = articleService.search(search, idCategorie, idFournisseur, actif, Pageable.unpaged()).getContent();
        List<Object[]> rows = articles.stream()
                .map(a -> new Object[]{
                        a.getCodeArticle(), a.getNomArticle(), a.getNomCategorie(), a.getNomFournisseur(),
                        a.getUnite(), a.getQuantiteStock(), a.getSeuilAlerte(), a.getPrixAchat(), a.getPrixVente(), a.getActif()
                })
                .toList();
        return ExcelExporter.asResponse("articles.xlsx", "Articles",
                new String[]{"Code", "Name", "Category", "Supplier", "Unit", "Stock", "Alert threshold", "Purchase price", "Sale price", "Active"}, rows);
    }

    @GetMapping("/alertes")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'CONSULTATION')")
    public ResponseEntity<List<ArticleDTO>> findAlertes() {
        return ResponseEntity.ok(articleService.findAlertes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'CONSULTATION')")
    public ResponseEntity<ArticleDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.findById(id));
    }

    @GetMapping("/{id}/stock-par-site")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'CONSULTATION')")
    public ResponseEntity<List<StockSiteDTO>> stockParSite(@PathVariable UUID id) {
        return ResponseEntity.ok(articleService.findStockParSite(id));
    }

    @PostMapping
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'AJOUT')")
    public ResponseEntity<ArticleDTO> create(@Valid @RequestBody ArticleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(articleService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'MODIFICATION')")
    public ResponseEntity<ArticleDTO> update(@PathVariable UUID id, @Valid @RequestBody ArticleDTO dto) {
        return ResponseEntity.ok(articleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'ARTICLES', 'SUPPRESSION')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        articleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
