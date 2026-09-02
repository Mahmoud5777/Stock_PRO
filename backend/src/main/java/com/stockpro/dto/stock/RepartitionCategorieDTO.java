package com.stockpro.dto.stock;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepartitionCategorieDTO {
    private String nomCategorie;
    private long nombreArticles;
    private BigDecimal valeurStock;
}
