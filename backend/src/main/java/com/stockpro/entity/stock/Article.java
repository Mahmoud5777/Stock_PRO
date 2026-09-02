package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ARTICLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @Column(name = "ID_ARTICLE", length = 32, nullable = false, updatable = false)
    private UUID idArticle;

    @Column(name = "COD_ARTICLE", length = 30, unique = true)
    private String codeArticle;

    @Column(name = "LIB_ARTICLE", length = 100)
    private String nomArticle;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "UNITE", length = 20)
    private String unite;

    @Column(name = "PRIX_ACHAT", precision = 14, scale = 3)
    private BigDecimal prixAchat;

    @Column(name = "PRIX_VENTE", precision = 14, scale = 3)
    private BigDecimal prixVente;

    @Column(name = "SEUIL_ALERTE", precision = 14, scale = 3)
    @Builder.Default
    private BigDecimal seuilAlerte = BigDecimal.ZERO;

    @Column(name = "F_ACTIF")
    @Builder.Default
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CATEGORIE")
    private Categorie categorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_FOURNISSEUR")
    private Fournisseur fournisseur;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "article")
    private List<StockSite> stockSites = new ArrayList<>();

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "article")
    private List<MouvementStock> mouvements = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idArticle == null) {
            this.idArticle = UUID.randomUUID();
        }
    }
}
