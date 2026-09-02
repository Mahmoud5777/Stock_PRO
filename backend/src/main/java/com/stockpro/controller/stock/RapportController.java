package com.stockpro.controller.stock;

import com.stockpro.dto.stock.RapportSyntheseDTO;
import com.stockpro.service.stock.RapportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final RapportService rapportService;

    @GetMapping("/synthese")
    @PreAuthorize("@accessGuard.can(authentication, 'RAPPORTS', 'CONSULTATION')")
    public ResponseEntity<RapportSyntheseDTO> synthese() {
        return ResponseEntity.ok(rapportService.synthese());
    }
}
