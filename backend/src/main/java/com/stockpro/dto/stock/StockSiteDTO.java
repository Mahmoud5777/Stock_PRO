package com.stockpro.dto.stock;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSiteDTO {
    private UUID idArticle;
    private String nomArticle;
    private UUID idSite;
    private String nomSite;
    private BigDecimal quantite;
}
