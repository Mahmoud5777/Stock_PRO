package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.ArticleDTO;
import com.stockpro.dto.stock.StockSiteDTO;
import com.stockpro.entity.stock.Article;
import com.stockpro.entity.stock.StockSite;
import com.stockpro.exception.BusinessException;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.ArticleMapper;
import com.stockpro.repository.stock.ArticleRepository;
import com.stockpro.repository.stock.CategorieRepository;
import com.stockpro.repository.stock.FournisseurRepository;
import com.stockpro.repository.stock.StockSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockpro.service.stock.ArticleService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;
    private final StockSiteRepository stockSiteRepository;
    private final ArticleMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ArticleDTO> findAll() {
        return enrichirQuantites(articleRepository.findByActifTrue().stream().map(mapper::toDto).collect(Collectors.toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDTO> findAll(Pageable pageable) {
        Page<ArticleDTO> page = articleRepository.findAll(pageable).map(mapper::toDto);
        enrichirQuantites(page.getContent());
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDTO> search(String query, UUID idCategorie, UUID idFournisseur, Pageable pageable) {
        Page<ArticleDTO> page = articleRepository
                .findAllWithFilters(query, idCategorie, idFournisseur, pageable)
                .map(mapper::toDto);
        enrichirQuantites(page.getContent());
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleDTO findById(UUID id) {
        ArticleDTO dto = mapper.toDto(getEntity(id));
        BigDecimal quantite = stockSiteRepository.sumQuantiteByArticle(id);
        dto.setQuantiteStock(quantite);
        dto.setEnAlerte(quantite.compareTo(dto.getSeuilAlerte() != null ? dto.getSeuilAlerte() : BigDecimal.ZERO) <= 0);
        return dto;
    }

    @Override
    public ArticleDTO create(ArticleDTO dto) {
        if (articleRepository.findByCodeArticle(dto.getCodeArticle()).isPresent()) {
            throw new BusinessException("Un article avec ce code existe déjà");
        }
        Article article = mapper.toEntity(dto);
        article.setIdArticle(null);
        article.setCategorie(resolveCategorie(dto.getIdCategorie()));
        article.setFournisseur(resolveFournisseur(dto.getIdFournisseur()));
        ArticleDTO created = mapper.toDto(articleRepository.save(article));
        created.setQuantiteStock(BigDecimal.ZERO);
        created.setEnAlerte(true);
        return created;
    }

    @Override
    public ArticleDTO update(UUID id, ArticleDTO dto) {
        Article existing = getEntity(id);
        existing.setCodeArticle(dto.getCodeArticle());
        existing.setNomArticle(dto.getNomArticle());
        existing.setDescription(dto.getDescription());
        existing.setUnite(dto.getUnite());
        existing.setPrixAchat(dto.getPrixAchat());
        existing.setPrixVente(dto.getPrixVente());
        existing.setSeuilAlerte(dto.getSeuilAlerte());
        existing.setActif(dto.getActif() != null ? dto.getActif() : true);
        existing.setCategorie(resolveCategorie(dto.getIdCategorie()));
        existing.setFournisseur(resolveFournisseur(dto.getIdFournisseur()));
        return findById(mapper.toDto(articleRepository.save(existing)).getIdArticle());
    }

    @Override
    public void delete(UUID id) {
        Article article = getEntity(id);
        BigDecimal quantite = stockSiteRepository.sumQuantiteByArticle(id);
        if (quantite.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Impossible de supprimer un article dont le stock n'est pas nul");
        }
        articleRepository.delete(article);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleDTO> findAlertes() {
        return findAll().stream()
                .filter(a -> Boolean.TRUE.equals(a.getEnAlerte()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockSiteDTO> findStockParSite(UUID idArticle) {
        return stockSiteRepository.findByArticle_IdArticle(idArticle).stream()
                .map(this::toStockSiteDto)
                .collect(Collectors.toList());
    }

    private StockSiteDTO toStockSiteDto(StockSite s) {
        return StockSiteDTO.builder()
                .idArticle(s.getArticle().getIdArticle())
                .nomArticle(s.getArticle().getNomArticle())
                .idSite(s.getSite().getIdSite())
                .nomSite(s.getSite().getNomSite())
                .quantite(s.getQuantite())
                .build();
    }

    /** Enrichit en une seule requête agrégée la quantité totale en stock (tous sites) de chaque article de la liste. */
    private List<ArticleDTO> enrichirQuantites(List<ArticleDTO> articles) {
        Map<UUID, BigDecimal> quantitesParArticle = stockSiteRepository.sumQuantiteGroupByArticle().stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (BigDecimal) row[1]));
        articles.forEach(a -> {
            BigDecimal quantite = quantitesParArticle.getOrDefault(a.getIdArticle(), BigDecimal.ZERO);
            a.setQuantiteStock(quantite);
            BigDecimal seuil = a.getSeuilAlerte() != null ? a.getSeuilAlerte() : BigDecimal.ZERO;
            a.setEnAlerte(quantite.compareTo(seuil) <= 0);
        });
        return articles;
    }

    private Article getEntity(UUID id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article", id));
    }

    private com.stockpro.entity.stock.Categorie resolveCategorie(UUID idCategorie) {
        if (idCategorie == null) return null;
        return categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie", idCategorie));
    }

    private com.stockpro.entity.stock.Fournisseur resolveFournisseur(UUID idFournisseur) {
        if (idFournisseur == null) return null;
        return fournisseurRepository.findById(idFournisseur)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur", idFournisseur));
    }
}
