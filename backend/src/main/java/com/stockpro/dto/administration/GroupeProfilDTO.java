package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeProfilDTO {

    private UUID idGroupeProfil;

    @NotNull(message = "L'idGr est obligatoire")
    private UUID idGr;

    @NotNull(message = "L'idPr est obligatoire")
    private UUID idPr;

    private Boolean actif;
    private LocalDate dateCreation;
}
