package com.stockpro.dto.stock;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDTO {

    private UUID idArticle;

    @NotBlank(message = "Le code article est obligatoire")
    @Size(max = 30)
    private String codeArticle;

    @NotBlank(message = "Le nom de l'article est obligatoire")
    @Size(max = 100)
    private String nomArticle;

    private String description;

    @Size(max = 20)
    private String unite;

    @NotNull(message = "Le prix d'achat est obligatoire")
    @PositiveOrZero(message = "Le prix d'achat doit être positif")
    private BigDecimal prixAchat;

    @NotNull(message = "Le prix de vente est obligatoire")
    @PositiveOrZero(message = "Le prix de vente doit être positif")
    private BigDecimal prixVente;

    @NotNull(message = "Le seuil d'alerte est obligatoire")
    @PositiveOrZero(message = "Le seuil d'alerte doit être positif")
    private BigDecimal seuilAlerte;

    @Builder.Default
    private Boolean actif = true;

    private UUID idCategorie;
    /** Libellé résolu côté service, pratique pour l'affichage en liste. */
    private String nomCategorie;

    private UUID idFournisseur;
    private String nomFournisseur;

    /** Quantité totale en stock, tous sites confondus (lecture seule, calculée). */
    private BigDecimal quantiteStock;

    /** Vrai si quantiteStock <= seuilAlerte (lecture seule, calculée). */
    private Boolean enAlerte;
}
