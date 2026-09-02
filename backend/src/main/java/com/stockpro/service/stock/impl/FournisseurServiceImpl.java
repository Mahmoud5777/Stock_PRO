package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.FournisseurDTO;
import com.stockpro.entity.stock.Fournisseur;
import com.stockpro.exception.BusinessException;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.FournisseurMapper;
import com.stockpro.repository.stock.FournisseurRepository;
import com.stockpro.service.stock.FournisseurService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FournisseurServiceImpl implements FournisseurService {

    private final FournisseurRepository fournisseurRepository;
    private final FournisseurMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<FournisseurDTO> findAll() {
        return fournisseurRepository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FournisseurDTO> findAll(Pageable pageable) {
        return fournisseurRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FournisseurDTO> search(String query, Pageable pageable) {
        return fournisseurRepository
                .findByNomFournisseurContainingIgnoreCaseOrCodeFournisseurContainingIgnoreCase(query, query, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public FournisseurDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    public FournisseurDTO create(FournisseurDTO dto) {
        if (fournisseurRepository.findByCodeFournisseur(dto.getCodeFournisseur()).isPresent()) {
            throw new BusinessException("Un fournisseur avec ce code existe déjà");
        }
        Fournisseur fournisseur = mapper.toEntity(dto);
        fournisseur.setIdFournisseur(null);
        return mapper.toDto(fournisseurRepository.save(fournisseur));
    }

    @Override
    public FournisseurDTO update(UUID id, FournisseurDTO dto) {
        Fournisseur existing = getEntity(id);
        existing.setCodeFournisseur(dto.getCodeFournisseur());
        existing.setNomFournisseur(dto.getNomFournisseur());
        existing.setContact(dto.getContact());
        existing.setTelephone(dto.getTelephone());
        existing.setEmail(dto.getEmail());
        existing.setAdresse(dto.getAdresse());
        return mapper.toDto(fournisseurRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        Fournisseur fournisseur = getEntity(id);
        if (!fournisseur.getArticles().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un fournisseur utilisé par des articles");
        }
        fournisseurRepository.delete(fournisseur);
    }

    private Fournisseur getEntity(UUID id) {
        return fournisseurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur", id));
    }
}
