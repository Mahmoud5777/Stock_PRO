package com.stockpro.controller.dashboard;

import com.stockpro.dto.dashboard.DashboardStatsDTO;
import com.stockpro.dto.dashboard.RecentActivityDTO;
import com.stockpro.dto.dashboard.RecentLoginDTO;
import com.stockpro.dto.dashboard.StockMovementPointDTO;
import com.stockpro.service.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Données du tableau de bord. Accessible à tout utilisateur authentifié
 * (pas de fonctionnalité/droit dédié : le Dashboard est le point d'entrée
 * commun à tous les profils — voir menu.config.ts côté frontend, code: null).
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Statistiques et activité récente pour le tableau de bord")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "KPIs globaux (articles, utilisateurs actifs, sites, fournisseurs, valeur du stock...)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @Operation(summary = "Entrées/sorties de stock agrégées par mois sur les 12 derniers mois")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/mouvements-stock")
    public ResponseEntity<List<StockMovementPointDTO>> getMouvementsStock() {
        return ResponseEntity.ok(dashboardService.getMouvementsStock());
    }

    @Operation(summary = "Les 10 derniers mouvements de stock, présentés comme activité récente")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/activites-recentes")
    public ResponseEntity<List<RecentActivityDTO>> getActivitesRecentes() {
        return ResponseEntity.ok(dashboardService.getActivitesRecentes());
    }

    @Operation(summary = "Les 10 dernières connexions (succès et échecs)")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/dernieres-connexions")
    public ResponseEntity<List<RecentLoginDTO>> getDernieresConnexions() {
        return ResponseEntity.ok(dashboardService.getDernieresConnexions());
    }
}
