package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.MouvementStockDTO;
import com.stockpro.entity.stock.MouvementStock;
import org.springframework.stereotype.Component;

@Component
public class MouvementStockMapper {

    public MouvementStockDTO toDto(MouvementStock entity) {
        if (entity == null) return null;
        return MouvementStockDTO.builder()
                .idMouvement(entity.getIdMouvement())
                .idArticle(entity.getArticle().getIdArticle())
                .codeArticle(entity.getArticle().getCodeArticle())
                .nomArticle(entity.getArticle().getNomArticle())
                .idSite(entity.getSite().getIdSite())
                .nomSite(entity.getSite().getNomSite())
                .nomUtilisateur(entity.getUtilisateur() != null ? entity.getUtilisateur().getNomComplet() : null)
                .typeMouvement(entity.getTypeMouvement())
                .quantite(entity.getQuantite())
                .quantiteAvant(entity.getQuantiteAvant())
                .quantiteApres(entity.getQuantiteApres())
                .motif(entity.getMotif())
                .referenceDoc(entity.getReferenceDoc())
                .dateMouvement(entity.getDateMouvement())
                .build();
    }
}
