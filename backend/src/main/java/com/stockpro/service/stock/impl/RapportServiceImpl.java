package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.ArticleDTO;
import com.stockpro.dto.stock.RapportSyntheseDTO;
import com.stockpro.dto.stock.RepartitionCategorieDTO;
import com.stockpro.repository.stock.ArticleRepository;
import com.stockpro.repository.stock.CategorieRepository;
import com.stockpro.repository.stock.FournisseurRepository;
import com.stockpro.repository.stock.MouvementStockRepository;
import com.stockpro.repository.stock.StockSiteRepository;
import com.stockpro.mapper.stock.MouvementStockMapper;
import com.stockpro.service.stock.ArticleService;
import com.stockpro.service.stock.RapportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RapportServiceImpl implements RapportService {

    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;
    private final ArticleRepository articleRepository;
    private final StockSiteRepository stockSiteRepository;
    private final MouvementStockRepository mouvementRepository;
    private final ArticleService articleService;
    private final MouvementStockMapper mouvementMapper;

    @Override
    public RapportSyntheseDTO synthese() {
        List<ArticleDTO> articles = articleService.findAll();
        List<ArticleDTO> alertes = articles.stream()
                .filter(a -> Boolean.TRUE.equals(a.getEnAlerte()))
                .collect(Collectors.toList());

        Map<String, List<ArticleDTO>> parCategorie = articles.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getNomCategorie() != null ? a.getNomCategorie() : "Sans catégorie",
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<RepartitionCategorieDTO> repartition = parCategorie.entrySet().stream()
                .map(e -> RepartitionCategorieDTO.builder()
                        .nomCategorie(e.getKey())
                        .nombreArticles(e.getValue().size())
                        .valeurStock(e.getValue().stream()
                                .map(a -> safe(a.getPrixAchat()).multiply(safe(a.getQuantiteStock())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .sorted(Comparator.comparing(RepartitionCategorieDTO::getValeurStock).reversed())
                .collect(Collectors.toList());

        return RapportSyntheseDTO.builder()
                .nombreArticles(articleRepository.count())
                .nombreCategories(categorieRepository.count())
                .nombreFournisseurs(fournisseurRepository.count())
                .nombreArticlesEnAlerte(alertes.size())
                .valeurStockTotal(stockSiteRepository.valeurStockTotal())
                .repartitionParCategorie(repartition)
                .derniersMouvements(mouvementRepository.findTop10ByOrderByDateMouvementDesc().stream()
                        .map(mouvementMapper::toDto)
                        .collect(Collectors.toList()))
                .articlesEnAlerte(alertes)
                .build();
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
