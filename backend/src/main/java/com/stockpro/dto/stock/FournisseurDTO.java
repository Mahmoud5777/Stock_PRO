package com.stockpro.dto.stock;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FournisseurDTO {

    private UUID idFournisseur;

    @NotBlank(message = "Le code fournisseur est obligatoire")
    @Size(max = 30)
    private String codeFournisseur;

    @NotBlank(message = "Le nom du fournisseur est obligatoire")
    @Size(max = 100)
    private String nomFournisseur;

    @Size(max = 150)
    private String contact;

    @Size(max = 20)
    private String telephone;

    @Email(message = "Format d'email invalide")
    @Size(max = 150)
    private String email;

    private String adresse;
}
