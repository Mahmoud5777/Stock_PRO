package com.stockpro.dto.stock;

import com.stockpro.entity.stock.StatutInventaire;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireDTO {
    private UUID idInventaire;
    private String codeInventaire;
    private UUID idSite;
    private String nomSite;
    private String nomResponsable;
    private StatutInventaire statut;
    private LocalDateTime dateInventaire;
    private LocalDateTime dateCloture;
    /** Nombre d'écarts non nuls constatés (rempli sur la liste et le détail). */
    private Integer nombreEcarts;
    private List<InventaireLigneDTO> lignes;
}
