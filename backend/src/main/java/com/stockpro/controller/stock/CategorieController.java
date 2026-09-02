package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.CategorieDTO;
import com.stockpro.service.stock.CategorieService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping("/all")
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'CONSULTATION')")
    public ResponseEntity<List<CategorieDTO>> findAll() {
        return ResponseEntity.ok(categorieService.findAll());
    }

    @GetMapping
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'CONSULTATION')")
    public ResponseEntity<PageResponseDTO<CategorieDTO>> findAll(
            @RequestParam(required = false) String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? categorieService.findAll(pageable)
                : categorieService.search(search, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'CONSULTATION')")
    public ResponseEntity<CategorieDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(categorieService.findById(id));
    }

    @PostMapping
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'AJOUT')")
    public ResponseEntity<CategorieDTO> create(@Valid @RequestBody CategorieDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categorieService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'MODIFICATION')")
    public ResponseEntity<CategorieDTO> update(@PathVariable UUID id, @Valid @RequestBody CategorieDTO dto) {
        return ResponseEntity.ok(categorieService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accessGuard.can(authentication, 'CATEGORIES', 'SUPPRESSION')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categorieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
