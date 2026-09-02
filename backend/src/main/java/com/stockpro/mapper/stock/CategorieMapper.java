package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.CategorieDTO;
import com.stockpro.entity.stock.Categorie;
import org.springframework.stereotype.Component;

@Component
public class CategorieMapper {

    public CategorieDTO toDto(Categorie entity) {
        if (entity == null) return null;
        return CategorieDTO.builder()
                .idCategorie(entity.getIdCategorie())
                .codeCategorie(entity.getCodeCategorie())
                .nomCategorie(entity.getNomCategorie())
                .description(entity.getDescription())
                .build();
    }

    public Categorie toEntity(CategorieDTO dto) {
        if (dto == null) return null;
        return Categorie.builder()
                .idCategorie(dto.getIdCategorie())
                .codeCategorie(dto.getCodeCategorie())
                .nomCategorie(dto.getNomCategorie())
                .description(dto.getDescription())
                .build();
    }
}
