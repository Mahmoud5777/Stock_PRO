package com.stockpro.entity.stock;

import com.stockpro.entity.administration.Site;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "STOCK_SITE", uniqueConstraints = @UniqueConstraint(columnNames = {"ID_ARTICLE", "ID_SITE"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSite {

    @Id
    @Column(name = "ID_STOCK_SITE", length = 32, nullable = false, updatable = false)
    private UUID idStockSite;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_ARTICLE")
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_SITE")
    private Site site;

    @Column(name = "QUANTITE", precision = 14, scale = 3)
    @Builder.Default
    private BigDecimal quantite = BigDecimal.ZERO;

    @PrePersist
    public void prePersist() {
        if (this.idStockSite == null) {
            this.idStockSite = UUID.randomUUID();
        }
        if (this.quantite == null) {
            this.quantite = BigDecimal.ZERO;
        }
    }
}
