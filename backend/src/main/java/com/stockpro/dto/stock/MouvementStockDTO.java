package com.stockpro.dto.stock;

import com.stockpro.entity.stock.TypeMouvement;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementStockDTO {

    private UUID idMouvement;

    private UUID idArticle;
    private String codeArticle;
    private String nomArticle;

    private UUID idSite;
    private String nomSite;

    private String nomUtilisateur;

    private TypeMouvement typeMouvement;
    private BigDecimal quantite;
    private BigDecimal quantiteAvant;
    private BigDecimal quantiteApres;

    private String motif;
    private String referenceDoc;
    private LocalDateTime dateMouvement;
}
