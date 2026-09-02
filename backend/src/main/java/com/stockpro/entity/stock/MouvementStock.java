package com.stockpro.entity.stock;

import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "MOUVEMENT_STOCK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementStock {

    @Id
    @Column(name = "ID_MOUVEMENT", length = 32, nullable = false, updatable = false)
    private UUID idMouvement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_ARTICLE")
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_SITE")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTIL")
    private User utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE_MOUVEMENT", length = 10, nullable = false)
    private TypeMouvement typeMouvement;

    @Column(name = "QUANTITE", precision = 14, scale = 3, nullable = false)
    private BigDecimal quantite;

    @Column(name = "QUANTITE_AVANT", precision = 14, scale = 3)
    private BigDecimal quantiteAvant;

    @Column(name = "QUANTITE_APRES", precision = 14, scale = 3)
    private BigDecimal quantiteApres;

    @Column(name = "MOTIF", length = 255)
    private String motif;

    @Column(name = "REFERENCE_DOC", length = 100)
    private String referenceDoc;

    @Column(name = "DATE_MOUVEMENT", nullable = false)
    @Builder.Default
    private LocalDateTime dateMouvement = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.idMouvement == null) {
            this.idMouvement = UUID.randomUUID();
        }
        if (this.dateMouvement == null) {
            this.dateMouvement = LocalDateTime.now();
        }
    }
}
