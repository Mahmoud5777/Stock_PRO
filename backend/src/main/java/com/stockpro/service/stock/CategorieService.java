package com.stockpro.service.stock;

import com.stockpro.dto.stock.CategorieDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategorieService {
    List<CategorieDTO> findAll();
    Page<CategorieDTO> findAll(Pageable pageable);
    Page<CategorieDTO> search(String query, Pageable pageable);
    CategorieDTO findById(UUID id);
    CategorieDTO create(CategorieDTO dto);
    CategorieDTO update(UUID id, CategorieDTO dto);
    void delete(UUID id);
}
