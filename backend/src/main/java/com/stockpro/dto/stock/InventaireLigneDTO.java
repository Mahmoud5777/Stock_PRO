package com.stockpro.dto.stock;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireLigneDTO {
    private UUID idLigne;
    private UUID idArticle;
    private String codeArticle;
    private String nomArticle;
    private String unite;
    private BigDecimal quantiteTheorique;
    private BigDecimal quantitePhysique;
    private BigDecimal ecart;
}
