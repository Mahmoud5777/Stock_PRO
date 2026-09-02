package com.stockpro.service.stock;

import com.stockpro.dto.stock.FournisseurDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FournisseurService {
    List<FournisseurDTO> findAll();
    Page<FournisseurDTO> findAll(Pageable pageable);
    Page<FournisseurDTO> search(String query, Pageable pageable);
    FournisseurDTO findById(UUID id);
    FournisseurDTO create(FournisseurDTO dto);
    FournisseurDTO update(UUID id, FournisseurDTO dto);
    void delete(UUID id);
}
