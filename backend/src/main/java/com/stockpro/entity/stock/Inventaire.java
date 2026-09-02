package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "INVENTAIRE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventaire {

    @Id
    @Column(name = "ID_INVENTAIRE", length = 32, nullable = false, updatable = false)
    private UUID idInventaire;

    @Column(name = "COD_INVENTAIRE", length = 30)
    private String codeInventaire;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_SITE")
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTIL")
    private User responsable;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUT", length = 15, nullable = false)
    @Builder.Default
    private StatutInventaire statut = StatutInventaire.EN_COURS;

    @Column(name = "DATE_INVENTAIRE", nullable = false)
    @Builder.Default
    private LocalDateTime dateInventaire = LocalDateTime.now();

    @Column(name = "DATE_CLOTURE")
    private LocalDateTime dateCloture;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "inventaire", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventaireLigne> lignes = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idInventaire == null) {
            this.idInventaire = UUID.randomUUID();
        }
        if (this.dateInventaire == null) {
            this.dateInventaire = LocalDateTime.now();
        }
    }
}
