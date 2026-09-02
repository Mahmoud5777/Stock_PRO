package com.stockpro.mapper.stock;

import com.stockpro.dto.stock.FournisseurDTO;
import com.stockpro.entity.stock.Fournisseur;
import org.springframework.stereotype.Component;

@Component
public class FournisseurMapper {

    public FournisseurDTO toDto(Fournisseur entity) {
        if (entity == null) return null;
        return FournisseurDTO.builder()
                .idFournisseur(entity.getIdFournisseur())
                .codeFournisseur(entity.getCodeFournisseur())
                .nomFournisseur(entity.getNomFournisseur())
                .contact(entity.getContact())
                .telephone(entity.getTelephone())
                .email(entity.getEmail())
                .adresse(entity.getAdresse())
                .build();
    }

    public Fournisseur toEntity(FournisseurDTO dto) {
        if (dto == null) return null;
        return Fournisseur.builder()
                .idFournisseur(dto.getIdFournisseur())
                .codeFournisseur(dto.getCodeFournisseur())
                .nomFournisseur(dto.getNomFournisseur())
                .contact(dto.getContact())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .adresse(dto.getAdresse())
                .build();
    }
}
