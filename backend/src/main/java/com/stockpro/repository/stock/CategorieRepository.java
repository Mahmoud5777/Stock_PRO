package com.stockpro.repository.stock;

import com.stockpro.entity.stock.Categorie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, UUID> {
    Optional<Categorie> findByCodeCategorie(String codeCategorie);
    Page<Categorie> findByNomCategorieContainingIgnoreCaseOrCodeCategorieContainingIgnoreCase(
            String nomCategorie, String codeCategorie, Pageable pageable);
}
