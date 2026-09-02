package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "FOURNISSEUR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fournisseur {

    @Id
    @Column(name = "ID_FOURNISSEUR", length = 32, nullable = false, updatable = false)
    private UUID idFournisseur;

    @Column(name = "COD_FOURNISSEUR", length = 30, unique = true)
    private String codeFournisseur;

    @Column(name = "LIB_FOURNISSEUR", length = 100)
    private String nomFournisseur;

    @Column(name = "CONTACT", length = 150)
    private String contact;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "EMAIL", length = 150)
    private String email;

    @Column(name = "ADRESSE", columnDefinition = "TEXT")
    private String adresse;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "fournisseur")
    private List<Article> articles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idFournisseur == null) {
            this.idFournisseur = UUID.randomUUID();
        }
    }
}
