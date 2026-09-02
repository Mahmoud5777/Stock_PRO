package com.stockpro.service.stock;

import com.stockpro.dto.stock.InventaireCreateDTO;
import com.stockpro.dto.stock.InventaireDTO;
import com.stockpro.dto.stock.InventaireLigneSaisieDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InventaireService {
    Page<InventaireDTO> findAll(UUID idSite, Pageable pageable);
    InventaireDTO findById(UUID id);
    InventaireDTO create(InventaireCreateDTO dto);
    InventaireDTO saisirLigne(UUID idInventaire, UUID idLigne, InventaireLigneSaisieDTO dto);
    InventaireDTO cloturer(UUID idInventaire);
}
