package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.MouvementCreateDTO;
import com.stockpro.dto.stock.MouvementStockDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import com.stockpro.entity.stock.Article;
import com.stockpro.entity.stock.MouvementStock;
import com.stockpro.entity.stock.StockSite;
import com.stockpro.entity.stock.TypeMouvement;
import com.stockpro.exception.BusinessException;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.MouvementStockMapper;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.repository.stock.ArticleRepository;
import com.stockpro.repository.stock.MouvementStockRepository;
import com.stockpro.repository.stock.StockSiteRepository;
import com.stockpro.service.stock.MouvementStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MouvementStockServiceImpl implements MouvementStockService {

    private final MouvementStockRepository mouvementRepository;
    private final StockSiteRepository stockSiteRepository;
    private final ArticleRepository articleRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final MouvementStockMapper mapper;

    @Override
    public MouvementStockDTO enregistrerEntree(MouvementCreateDTO dto) {
        Article article = resolveArticle(dto.getIdArticle());
        Site site = resolveSite(dto.getIdSite());
        StockSite stockSite = resolveOuCreerStockSite(article, site);

        BigDecimal avant = stockSite.getQuantite();
        BigDecimal apres = avant.add(dto.getQuantite());
        stockSite.setQuantite(apres);
        stockSiteRepository.save(stockSite);

        MouvementStock mouvement = MouvementStock.builder()
                .article(article)
                .site(site)
                .utilisateur(currentUser())
                .typeMouvement(TypeMouvement.ENTREE)
                .quantite(dto.getQuantite())
                .quantiteAvant(avant)
                .quantiteApres(apres)
                .motif(dto.getMotif())
                .referenceDoc(dto.getReferenceDoc())
                .build();
        return mapper.toDto(mouvementRepository.save(mouvement));
    }

    @Override
    public MouvementStockDTO enregistrerSortie(MouvementCreateDTO dto) {
        Article article = resolveArticle(dto.getIdArticle());
        Site site = resolveSite(dto.getIdSite());
        StockSite stockSite = resolveOuCreerStockSite(article, site);

        BigDecimal avant = stockSite.getQuantite();
        if (avant.compareTo(dto.getQuantite()) < 0) {
            throw new BusinessException(
                    "Stock insuffisant pour \"" + article.getNomArticle() + "\" sur le site \"" + site.getNomSite()
                            + "\" (disponible : " + avant + ")");
        }
        BigDecimal apres = avant.subtract(dto.getQuantite());
        stockSite.setQuantite(apres);
        stockSiteRepository.save(stockSite);

        MouvementStock mouvement = MouvementStock.builder()
                .article(article)
                .site(site)
                .utilisateur(currentUser())
                .typeMouvement(TypeMouvement.SORTIE)
                .quantite(dto.getQuantite())
                .quantiteAvant(avant)
                .quantiteApres(apres)
                .motif(dto.getMotif())
                .referenceDoc(dto.getReferenceDoc())
                .build();
        return mapper.toDto(mouvementRepository.save(mouvement));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MouvementStockDTO> findEntrees(String search, UUID idSite, Pageable pageable) {
        return mouvementRepository.findByTypeWithFilters(TypeMouvement.ENTREE, search, idSite, pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MouvementStockDTO> findSorties(String search, UUID idSite, Pageable pageable) {
        return mouvementRepository.findByTypeWithFilters(TypeMouvement.SORTIE, search, idSite, pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MouvementStockDTO> findDerniersMouvements() {
        return mouvementRepository.findTop10ByOrderByDateMouvementDesc().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    private StockSite resolveOuCreerStockSite(Article article, Site site) {
        return stockSiteRepository.findByArticle_IdArticleAndSite_IdSite(article.getIdArticle(), site.getIdSite())
                .orElseGet(() -> StockSite.builder().article(article).site(site).quantite(BigDecimal.ZERO).build());
    }

    private Article resolveArticle(UUID id) {
        return articleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Article", id));
    }

    private Site resolveSite(UUID id) {
        return siteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Site", id));
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return userRepository.findByLogin(authentication.getName()).orElse(null);
    }
}
