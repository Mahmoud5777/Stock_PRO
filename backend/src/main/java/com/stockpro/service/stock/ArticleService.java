package com.stockpro.service.stock;

import com.stockpro.dto.stock.ArticleDTO;
import com.stockpro.dto.stock.StockSiteDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ArticleService {
    List<ArticleDTO> findAll();
    Page<ArticleDTO> findAll(Pageable pageable);
    Page<ArticleDTO> search(String query, UUID idCategorie, UUID idFournisseur, Pageable pageable);
    ArticleDTO findById(UUID id);
    ArticleDTO create(ArticleDTO dto);
    ArticleDTO update(UUID id, ArticleDTO dto);
    void delete(UUID id);
    List<ArticleDTO> findAlertes();
    List<StockSiteDTO> findStockParSite(UUID idArticle);
}
