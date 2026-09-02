package com.stockpro.dto.stock;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieDTO {

    private UUID idCategorie;

    @NotBlank(message = "Le code de la catégorie est obligatoire")
    @Size(max = 30)
    private String codeCategorie;

    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    @Size(max = 100)
    private String nomCategorie;

    private String description;

    /** Nombre d'articles rattachés (lecture seule, calculé côté service). */
    private Long nombreArticles;
}
