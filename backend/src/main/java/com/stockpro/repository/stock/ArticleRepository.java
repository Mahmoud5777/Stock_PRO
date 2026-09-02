package com.stockpro.repository.stock;

import com.stockpro.entity.stock.Article;
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
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    Optional<Article> findByCodeArticle(String codeArticle);

    @Query(value = """
        SELECT a FROM Article a
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(a.nomArticle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.codeArticle) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:idCategorie IS NULL OR a.categorie.idCategorie = :idCategorie)
          AND (:idFournisseur IS NULL OR a.fournisseur.idFournisseur = :idFournisseur)
        """,
            countQuery = """
        SELECT COUNT(a) FROM Article a
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(a.nomArticle) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.codeArticle) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:idCategorie IS NULL OR a.categorie.idCategorie = :idCategorie)
          AND (:idFournisseur IS NULL OR a.fournisseur.idFournisseur = :idFournisseur)
        """)
    Page<Article> findAllWithFilters(
            @Param("search") String search,
            @Param("idCategorie") UUID idCategorie,
            @Param("idFournisseur") UUID idFournisseur,
            Pageable pageable);

    List<Article> findByActifTrue();
}
