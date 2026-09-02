package com.stockpro.repository.stock;

import com.stockpro.entity.stock.InventaireLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventaireLigneRepository extends JpaRepository<InventaireLigne, UUID> {
    List<InventaireLigne> findByInventaire_IdInventaire(UUID idInventaire);
}
