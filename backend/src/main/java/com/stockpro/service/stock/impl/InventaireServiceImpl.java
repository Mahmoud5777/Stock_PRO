package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.InventaireCreateDTO;
import com.stockpro.dto.stock.InventaireDTO;
import com.stockpro.dto.stock.InventaireLigneSaisieDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import com.stockpro.entity.stock.*;
import com.stockpro.exception.BusinessException;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.InventaireMapper;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.repository.stock.*;
import com.stockpro.service.stock.InventaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InventaireServiceImpl implements InventaireService {

    private final InventaireRepository inventaireRepository;
    private final InventaireLigneRepository ligneRepository;
    private final ArticleRepository articleRepository;
    private final StockSiteRepository stockSiteRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final MouvementStockRepository mouvementRepository;
    private final InventaireMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<InventaireDTO> findAll(UUID idSite, Pageable pageable) {
        return inventaireRepository.findAllWithFilters(idSite, pageable).map(i -> mapper.toDto(i, false));
    }

    @Override
    @Transactional(readOnly = true)
    public InventaireDTO findById(UUID id) {
        return mapper.toDto(getEntity(id), true);
    }

    @Override
    public InventaireDTO create(InventaireCreateDTO dto) {
        Site site = siteRepository.findById(dto.getIdSite())
                .orElseThrow(() -> new ResourceNotFoundException("Site", dto.getIdSite()));

        Inventaire inventaire = Inventaire.builder()
                .site(site)
                .responsable(currentUser())
                .statut(StatutInventaire.EN_COURS)
                .codeInventaire(genererCode())
                .build();

        List<Article> articles = articleRepository.findByActifTrue();
        for (Article article : articles) {
            BigDecimal theorique = stockSiteRepository
                    .findByArticle_IdArticleAndSite_IdSite(article.getIdArticle(), site.getIdSite())
                    .map(StockSite::getQuantite)
                    .orElse(BigDecimal.ZERO);
            inventaire.getLignes().add(InventaireLigne.builder()
                    .inventaire(inventaire)
                    .article(article)
                    .quantiteTheorique(theorique)
                    .build());
        }

        return mapper.toDto(inventaireRepository.save(inventaire), true);
    }

    @Override
    public InventaireDTO saisirLigne(UUID idInventaire, UUID idLigne, InventaireLigneSaisieDTO dto) {
        Inventaire inventaire = getEntity(idInventaire);
        if (inventaire.getStatut() == StatutInventaire.CLOTURE) {
            throw new BusinessException("Cet inventaire est clôturé, il ne peut plus être modifié");
        }
        InventaireLigne ligne = inventaire.getLignes().stream()
                .filter(l -> l.getIdLigne().equals(idLigne))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ligne d'inventaire", idLigne));

        ligne.setQuantitePhysique(dto.getQuantitePhysique());
        ligne.setEcart(dto.getQuantitePhysique().subtract(ligne.getQuantiteTheorique()));
        ligneRepository.save(ligne);

        return mapper.toDto(inventaire, true);
    }

    @Override
    public InventaireDTO cloturer(UUID idInventaire) {
        Inventaire inventaire = getEntity(idInventaire);
        if (inventaire.getStatut() == StatutInventaire.CLOTURE) {
            throw new BusinessException("Cet inventaire est déjà clôturé");
        }

        for (InventaireLigne ligne : inventaire.getLignes()) {
            if (ligne.getQuantitePhysique() == null || ligne.getEcart() == null
                    || ligne.getEcart().compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }
            StockSite stockSite = stockSiteRepository
                    .findByArticle_IdArticleAndSite_IdSite(ligne.getArticle().getIdArticle(), inventaire.getSite().getIdSite())
                    .orElseGet(() -> StockSite.builder()
                            .article(ligne.getArticle())
                            .site(inventaire.getSite())
                            .quantite(BigDecimal.ZERO)
                            .build());

            BigDecimal avant = stockSite.getQuantite();
            stockSite.setQuantite(ligne.getQuantitePhysique());
            stockSiteRepository.save(stockSite);

            mouvementRepository.save(MouvementStock.builder()
                    .article(ligne.getArticle())
                    .site(inventaire.getSite())
                    .utilisateur(currentUser())
                    .typeMouvement(TypeMouvement.AJUSTEMENT)
                    .quantite(ligne.getEcart().abs())
                    .quantiteAvant(avant)
                    .quantiteApres(ligne.getQuantitePhysique())
                    .motif("Ajustement suite inventaire " + inventaire.getCodeInventaire())
                    .build());
        }

        inventaire.setStatut(StatutInventaire.CLOTURE);
        inventaire.setDateCloture(LocalDateTime.now());
        return mapper.toDto(inventaireRepository.save(inventaire), true);
    }

    private Inventaire getEntity(UUID id) {
        return inventaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventaire", id));
    }

    private String genererCode() {
        String horodatage = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "INV-" + horodatage;
    }

    private User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return userRepository.findByLogin(authentication.getName()).orElse(null);
    }
}
