package com.stockpro.dto.stock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/** Payload de saisie d'une entrée ou d'une sortie de stock. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementCreateDTO {

    @NotNull(message = "L'article est obligatoire")
    private UUID idArticle;

    @NotNull(message = "Le site est obligatoire")
    private UUID idSite;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être strictement positive")
    private BigDecimal quantite;

    @Size(max = 255)
    private String motif;

    @Size(max = 100)
    private String referenceDoc;
}
