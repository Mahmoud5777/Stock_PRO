package com.stockpro.dto.stock;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportSyntheseDTO {
    private long nombreArticles;
    private long nombreCategories;
    private long nombreFournisseurs;
    private long nombreArticlesEnAlerte;
    private BigDecimal valeurStockTotal;
    private List<RepartitionCategorieDTO> repartitionParCategorie;
    private List<MouvementStockDTO> derniersMouvements;
    private List<ArticleDTO> articlesEnAlerte;
}
