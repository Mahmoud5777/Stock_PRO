package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Fonctionnalite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FonctionnaliteRepository extends JpaRepository<Fonctionnalite, String> {
    Optional<Fonctionnalite> findByCodeFonc(String codeFonc);
    List<Fonctionnalite> findByApplication_IdApp(UUID idApp);
    List<Fonctionnalite> findByFonctionMere_IdFonc(UUID idFoncMere);
    List<Fonctionnalite> findByFonctionMereIsNull();
    Page<Fonctionnalite> findByLibelleContainingIgnoreCaseOrCodeFoncContainingIgnoreCase(String libelle, String codeFonc, Pageable pageable);

    @Query(value = """
        SELECT f FROM Fonctionnalite f
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(f.libelle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(f.codeFonc) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:actif IS NULL OR f.actif = :actif)
        """,
            countQuery = """
        SELECT COUNT(f) FROM Fonctionnalite f
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(f.libelle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(f.codeFonc) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:actif IS NULL OR f.actif = :actif)
        """)
    Page<Fonctionnalite> findAllWithFilters(
            @Param("search") String search,
            @Param("actif") Boolean actif,
            Pageable pageable);
}
