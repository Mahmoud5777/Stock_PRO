package com.stockpro.dto.dashboard;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementPointDTO {
    private String mois;
    private BigDecimal entrees;
    private BigDecimal sorties;
}
