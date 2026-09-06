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
public class GroupeRoleDTO {

    private UUID idGroupeRole;

    @NotNull(message = "L'idRl est obligatoire")
    private UUID idRl;

    @NotNull(message = "L'idGr est obligatoire")
    private UUID idGr;

    private Boolean actif;
    private LocalDate dateCreation;
}
