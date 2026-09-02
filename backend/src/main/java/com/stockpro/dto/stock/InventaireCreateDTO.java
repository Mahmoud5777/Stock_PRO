package com.stockpro.dto.stock;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/** Payload d'ouverture d'un nouvel inventaire pour un site : les lignes
 *  sont générées automatiquement à partir du stock théorique courant. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireCreateDTO {
    @NotNull(message = "Le site est obligatoire")
    private UUID idSite;
}
