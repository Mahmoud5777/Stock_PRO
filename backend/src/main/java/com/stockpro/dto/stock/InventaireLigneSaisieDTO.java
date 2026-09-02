package com.stockpro.dto.stock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireLigneSaisieDTO {

    @NotNull(message = "La quantité comptée est obligatoire")
    @PositiveOrZero(message = "La quantité comptée doit être positive")
    private java.math.BigDecimal quantitePhysique;
}
