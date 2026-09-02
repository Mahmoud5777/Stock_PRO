package com.stockpro.repository.stock;

import com.stockpro.entity.stock.MouvementStock;
import com.stockpro.entity.stock.TypeMouvement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MouvementStockRepository extends JpaRepository<MouvementStock, UUID> {

    @Query(value = """
        SELECT m FROM MouvementStock m
        WHERE m.typeMouvement = :type
          AND (:search IS NULL OR :search = ''
               OR LOWER(m.article.nomArticle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(m.article.codeArticle) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:idSite IS NULL OR m.site.idSite = :idSite)
        """,
            countQuery = """
        SELECT COUNT(m) FROM MouvementStock m
        WHERE m.typeMouvement = :type
          AND (:search IS NULL OR :search = ''
               OR LOWER(m.article.nomArticle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(m.article.codeArticle) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:idSite IS NULL OR m.site.idSite = :idSite)
        """)
    Page<MouvementStock> findByTypeWithFilters(
            @Param("type") TypeMouvement type,
            @Param("search") String search,
            @Param("idSite") UUID idSite,
            Pageable pageable);

    List<MouvementStock> findTop10ByOrderByDateMouvementDesc();
}
