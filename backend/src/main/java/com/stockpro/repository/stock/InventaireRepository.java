package com.stockpro.repository.stock;

import com.stockpro.entity.stock.Inventaire;
import com.stockpro.entity.stock.StatutInventaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventaireRepository extends JpaRepository<Inventaire, UUID> {

    @Query(value = """
        SELECT i FROM Inventaire i
        WHERE (:idSite IS NULL OR i.site.idSite = :idSite)
          AND (:search IS NULL OR :search = '' OR LOWER(i.codeInventaire) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:statut IS NULL OR i.statut = :statut)
        ORDER BY i.dateInventaire DESC
        """,
            countQuery = """
        SELECT COUNT(i) FROM Inventaire i
        WHERE (:idSite IS NULL OR i.site.idSite = :idSite)
          AND (:search IS NULL OR :search = '' OR LOWER(i.codeInventaire) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:statut IS NULL OR i.statut = :statut)
        """)
    Page<Inventaire> findAllWithFilters(
            @Param("idSite") UUID idSite,
            @Param("search") String search,
            @Param("statut") StatutInventaire statut,
            Pageable pageable);

    long countByStatut(StatutInventaire statut);
}
