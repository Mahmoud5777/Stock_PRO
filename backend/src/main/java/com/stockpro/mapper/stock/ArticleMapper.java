package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.ArticleDTO;
import com.stockpro.entity.stock.Article;
import com.stockpro.entity.stock.Categorie;
import com.stockpro.entity.stock.Fournisseur;
import org.springframework.stereotype.Component;

@Component
public class ArticleMapper {

    public ArticleDTO toDto(Article entity) {
        if (entity == null) return null;
        return ArticleDTO.builder()
                .idArticle(entity.getIdArticle())
                .codeArticle(entity.getCodeArticle())
                .nomArticle(entity.getNomArticle())
                .description(entity.getDescription())
                .unite(entity.getUnite())
                .prixAchat(entity.getPrixAchat())
                .prixVente(entity.getPrixVente())
                .seuilAlerte(entity.getSeuilAlerte())
                .actif(entity.getActif())
                .idCategorie(entity.getCategorie() != null ? entity.getCategorie().getIdCategorie() : null)
                .nomCategorie(entity.getCategorie() != null ? entity.getCategorie().getNomCategorie() : null)
                .idFournisseur(entity.getFournisseur() != null ? entity.getFournisseur().getIdFournisseur() : null)
                .nomFournisseur(entity.getFournisseur() != null ? entity.getFournisseur().getNomFournisseur() : null)
                .build();
    }

    public Article toEntity(ArticleDTO dto) {
        if (dto == null) return null;
        Article.ArticleBuilder builder = Article.builder()
                .idArticle(dto.getIdArticle())
                .codeArticle(dto.getCodeArticle())
                .nomArticle(dto.getNomArticle())
                .description(dto.getDescription())
                .unite(dto.getUnite())
                .prixAchat(dto.getPrixAchat())
                .prixVente(dto.getPrixVente())
                .seuilAlerte(dto.getSeuilAlerte())
                .actif(dto.getActif() != null ? dto.getActif() : true);
        if (dto.getIdCategorie() != null) {
            builder.categorie(Categorie.builder().idCategorie(dto.getIdCategorie()).build());
        }
        if (dto.getIdFournisseur() != null) {
            builder.fournisseur(Fournisseur.builder().idFournisseur(dto.getIdFournisseur()).build());
        }
        return builder.build();
    }
}
