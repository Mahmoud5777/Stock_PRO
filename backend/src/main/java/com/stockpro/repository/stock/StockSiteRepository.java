package com.stockpro.repository.stock;

import com.stockpro.entity.stock.StockSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockSiteRepository extends JpaRepository<StockSite, UUID> {

    Optional<StockSite> findByArticle_IdArticleAndSite_IdSite(UUID idArticle, UUID idSite);

    List<StockSite> findByArticle_IdArticle(UUID idArticle);

    List<StockSite> findBySite_IdSite(UUID idSite);

    @Query("SELECT COALESCE(SUM(s.quantite), 0) FROM StockSite s WHERE s.article.idArticle = :idArticle")
    BigDecimal sumQuantiteByArticle(@Param("idArticle") UUID idArticle);

    @Query("""
        SELECT s.article.idArticle, COALESCE(SUM(s.quantite), 0)
        FROM StockSite s
        GROUP BY s.article.idArticle
        """)
    List<Object[]> sumQuantiteGroupByArticle();

    @Query("SELECT COALESCE(SUM(s.quantite * a.prixAchat), 0) FROM StockSite s JOIN s.article a")
    BigDecimal valeurStockTotal();
}
