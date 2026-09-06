package com.stockpro.dto.administration;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private UUID idUtil;

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(max = 150)
    private String nomComplet;

    @NotBlank(message = "Le login est obligatoire")
    @Size(min = 3, max = 100)
    private String login;

    // Ecriture uniquement : jamais renvoyé dans les réponses JSON
    // Requis à la création, optionnel en modification (réinitialisation).
    // Pas de @Size ici : elle échouerait sur "" (taille 0) envoyé par le formulaire
    // d'édition quand l'utilisateur ne change pas son mot de passe. La longueur
    // minimale est vérifiée dans UserServiceImpl, uniquement quand un mot de passe
    // est réellement fourni (create, ou update avec changement de mot de passe).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String motPasse;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @Size(max = 20)
    private String telephone;

    private Boolean etatCompte;

    private Boolean doitChangerMdp;

    private LocalDate dateCreation;
}
