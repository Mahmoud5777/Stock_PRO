package com.stockpro.service.dashboard.impl;

import com.stockpro.dto.dashboard.DashboardStatsDTO;
import com.stockpro.dto.dashboard.RecentActivityDTO;
import com.stockpro.dto.dashboard.RecentLoginDTO;
import com.stockpro.dto.dashboard.StockMovementPointDTO;
import com.stockpro.entity.audit.AuditAction;
import com.stockpro.entity.audit.LogAcces;
import com.stockpro.entity.stock.MouvementStock;
import com.stockpro.entity.stock.TypeMouvement;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.repository.audit.LogAccesRepository;
import com.stockpro.repository.stock.ArticleRepository;
import com.stockpro.repository.stock.FournisseurRepository;
import com.stockpro.repository.stock.MouvementStockRepository;
import com.stockpro.repository.stock.StockSiteRepository;
import com.stockpro.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final FournisseurRepository fournisseurRepository;
    private final MouvementStockRepository mouvementStockRepository;
    private final StockSiteRepository stockSiteRepository;
    private final LogAccesRepository logAccesRepository;

    @Override
    public DashboardStatsDTO getStats() {
        List<StockMovementPointDTO> last12Months = getMouvementsStock();
        StockMovementPointDTO currentMonth = last12Months.get(last12Months.size() - 1);
        StockMovementPointDTO previousMonth = last12Months.size() > 1
                ? last12Months.get(last12Months.size() - 2)
                : StockMovementPointDTO.builder().entrees(BigDecimal.ZERO).sorties(BigDecimal.ZERO).build();

        BigDecimal currentTotal = currentMonth.getEntrees().add(currentMonth.getSorties());
        BigDecimal previousTotal = previousMonth.getEntrees().add(previousMonth.getSorties());
        double variationPct = previousTotal.signum() == 0
                ? 0d
                : currentTotal.subtract(previousTotal)
                        .divide(previousTotal, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();

        BigDecimal valeurStock = stockSiteRepository.valeurStockTotal();

        return DashboardStatsDTO.builder()
                .totalArticles(articleRepository.count())
                .totalUtilisateurs(userRepository.countByEtatCompteTrue())
                .totalSites(siteRepository.count())
                .totalFournisseurs(fournisseurRepository.count())
                .entreesStockMois(currentMonth.getEntrees())
                .sortiesStockMois(currentMonth.getSorties())
                .valeurStock(valeurStock != null ? valeurStock : BigDecimal.ZERO)
                .variationStockPct(variationPct)
                .build();
    }

    @Override
    public List<StockMovementPointDTO> getMouvementsStock() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(11);
        LocalDateTime since = startMonth.atDay(1).atStartOfDay();

        Map<YearMonth, BigDecimal[]> byMonth = new LinkedHashMap<>();
        YearMonth cursor = startMonth;
        while (!cursor.isAfter(currentMonth)) {
            byMonth.put(cursor, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            cursor = cursor.plusMonths(1);
        }

        List<MouvementStock> movements = mouvementStockRepository.findByDateMouvementAfter(since);
        for (MouvementStock m : movements) {
            YearMonth ym = YearMonth.from(m.getDateMouvement());
            BigDecimal[] bucket = byMonth.get(ym);
            if (bucket == null || m.getQuantite() == null) continue;
            if (m.getTypeMouvement() == TypeMouvement.ENTREE) {
                bucket[0] = bucket[0].add(m.getQuantite());
            } else if (m.getTypeMouvement() == TypeMouvement.SORTIE) {
                bucket[1] = bucket[1].add(m.getQuantite());
            }
        }

        return byMonth.entrySet().stream()
                .map(e -> StockMovementPointDTO.builder()
                        .mois(e.getKey().format(MONTH_LABEL))
                        .entrees(e.getValue()[0])
                        .sorties(e.getValue()[1])
                        .build())
                .toList();
    }

    @Override
    public List<RecentActivityDTO> getActivitesRecentes() {
        return mouvementStockRepository.findTop10ByOrderByDateMouvementDesc().stream()
                .map(this::toActivityDto)
                .collect(Collectors.toList());
    }

    private RecentActivityDTO toActivityDto(MouvementStock m) {
        String utilisateur = m.getUtilisateur() != null ? m.getUtilisateur().getNomComplet() : "System";
        String article = m.getArticle() != null ? m.getArticle().getNomArticle() : "an article";
        String site = m.getSite() != null ? m.getSite().getNomSite() : "";
        String type;
        String libelle;
        switch (m.getTypeMouvement()) {
            case ENTREE -> {
                type = "creation";
                libelle = "Received " + m.getQuantite() + " units of " + article + " at " + site;
            }
            case SORTIE -> {
                type = "suppression";
                libelle = "Removed " + m.getQuantite() + " units of " + article + " from " + site;
            }
            default -> {
                type = "modification";
                libelle = "Adjusted stock of " + article + " at " + site + " (" + m.getQuantite() + ")";
            }
        }
        return RecentActivityDTO.builder()
                .id(m.getIdMouvement().toString())
                .libelle(libelle)
                .utilisateur(utilisateur)
                .date(m.getDateMouvement())
                .type(type)
                .build();
    }

    @Override
    public List<RecentLoginDTO> getDernieresConnexions() {
        List<LogAcces> logs = logAccesRepository.findTop10ByActionInOrderByDateAccesDesc(
                List.of(AuditAction.LOGIN_SUCCESS, AuditAction.LOGIN_FAILURE));

        List<RecentLoginDTO> result = new ArrayList<>();
        for (LogAcces log : logs) {
            String nomComplet = userRepository.findByLogin(log.getLogin())
                    .map(u -> u.getNomComplet())
                    .orElse(log.getLogin());
            result.add(RecentLoginDTO.builder()
                    .idUtil(log.getIdUtil() != null ? log.getIdUtil().toString() : log.getLogin())
                    .nomComplet(nomComplet)
                    .login(log.getLogin())
                    .dateConnexion(log.getDateAcces())
                    .adresseIp(log.getAdresseIp())
                    .statut(log.getAction() == AuditAction.LOGIN_SUCCESS ? "succes" : "echec")
                    .build());
        }
        result.sort(Comparator.comparing(RecentLoginDTO::getDateConnexion).reversed());
        return result;
    }
}
