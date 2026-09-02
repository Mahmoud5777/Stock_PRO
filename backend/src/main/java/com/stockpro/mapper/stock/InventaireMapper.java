package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.InventaireDTO;
import com.stockpro.dto.stock.InventaireLigneDTO;
import com.stockpro.entity.stock.Inventaire;
import com.stockpro.entity.stock.InventaireLigne;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InventaireMapper {

    public InventaireLigneDTO toDto(InventaireLigne ligne) {
        if (ligne == null) return null;
        return InventaireLigneDTO.builder()
                .idLigne(ligne.getIdLigne())
                .idArticle(ligne.getArticle().getIdArticle())
                .codeArticle(ligne.getArticle().getCodeArticle())
                .nomArticle(ligne.getArticle().getNomArticle())
                .unite(ligne.getArticle().getUnite())
                .quantiteTheorique(ligne.getQuantiteTheorique())
                .quantitePhysique(ligne.getQuantitePhysique())
                .ecart(ligne.getEcart())
                .build();
    }

    public InventaireDTO toDto(Inventaire entity, boolean withLignes) {
        if (entity == null) return null;
        List<InventaireLigneDTO> lignes = withLignes
                ? entity.getLignes().stream().map(this::toDto).toList()
                : null;
        long nombreEcarts = entity.getLignes().stream()
                .filter(l -> l.getEcart() != null && l.getEcart().signum() != 0)
                .count();
        return InventaireDTO.builder()
                .idInventaire(entity.getIdInventaire())
                .codeInventaire(entity.getCodeInventaire())
                .idSite(entity.getSite().getIdSite())
                .nomSite(entity.getSite().getNomSite())
                .nomResponsable(entity.getResponsable() != null ? entity.getResponsable().getNomComplet() : null)
                .statut(entity.getStatut())
                .dateInventaire(entity.getDateInventaire())
                .dateCloture(entity.getDateCloture())
                .nombreEcarts((int) nombreEcarts)
                .lignes(lignes)
                .build();
    }
}
