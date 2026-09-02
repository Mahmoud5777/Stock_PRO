package com.stockpro.entity.stock;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "CATEGORIE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {

    @Id
    @Column(name = "ID_CATEGORIE", length = 32, nullable = false, updatable = false)
    private UUID idCategorie;

    @Column(name = "COD_CATEGORIE", length = 30, unique = true)
    private String codeCategorie;

    @Column(name = "LIB_CATEGORIE", length = 100)
    private String nomCategorie;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "categorie")
    private List<Article> articles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idCategorie == null) {
            this.idCategorie = UUID.randomUUID();
        }
    }
}
