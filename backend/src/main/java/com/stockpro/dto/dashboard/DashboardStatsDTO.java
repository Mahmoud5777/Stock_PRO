package com.stockpro.dto.dashboard;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalArticles;
    private long totalUtilisateurs;
    private long totalSites;
    private long totalFournisseurs;
    private BigDecimal entreesStockMois;
    private BigDecimal sortiesStockMois;
    private BigDecimal valeurStock;
    private double variationStockPct;
}
