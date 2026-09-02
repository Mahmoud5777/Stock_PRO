package com.stockpro.service.stock;

import com.stockpro.dto.stock.MouvementCreateDTO;
import com.stockpro.dto.stock.MouvementStockDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MouvementStockService {
    MouvementStockDTO enregistrerEntree(MouvementCreateDTO dto);
    MouvementStockDTO enregistrerSortie(MouvementCreateDTO dto);
    Page<MouvementStockDTO> findEntrees(String search, UUID idSite, Pageable pageable);
    Page<MouvementStockDTO> findSorties(String search, UUID idSite, Pageable pageable);
    List<MouvementStockDTO> findDerniersMouvements();
}
