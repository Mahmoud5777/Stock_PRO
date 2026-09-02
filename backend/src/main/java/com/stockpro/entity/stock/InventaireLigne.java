package com.stockpro.entity.stock;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "INVENTAIRE_LIGNE", uniqueConstraints = @UniqueConstraint(columnNames = {"ID_INVENTAIRE", "ID_ARTICLE"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireLigne {

    @Id
    @Column(name = "ID_LIGNE", length = 32, nullable = false, updatable = false)
    private UUID idLigne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_INVENTAIRE")
    private Inventaire inventaire;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_ARTICLE")
    private Article article;

    @Column(name = "QUANTITE_THEORIQUE", precision = 14, scale = 3)
    @Builder.Default
    private BigDecimal quantiteTheorique = BigDecimal.ZERO;

    @Column(name = "QUANTITE_PHYSIQUE", precision = 14, scale = 3)
    private BigDecimal quantitePhysique;

    @Column(name = "ECART", precision = 14, scale = 3)
    private BigDecimal ecart;

    @PrePersist
    public void prePersist() {
        if (this.idLigne == null) {
            this.idLigne = UUID.randomUUID();
        }
    }
}
