package com.stockpro.repository.stock;

import com.stockpro.entity.stock.Fournisseur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, UUID> {
    Optional<Fournisseur> findByCodeFournisseur(String codeFournisseur);
    Page<Fournisseur> findByNomFournisseurContainingIgnoreCaseOrCodeFournisseurContainingIgnoreCase(
            String nomFournisseur, String codeFournisseur, Pageable pageable);
}
