package com.stockpro.service.stock.impl;

import com.stockpro.dto.stock.CategorieDTO;
import com.stockpro.entity.stock.Categorie;
import com.stockpro.exception.BusinessException;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.stock.CategorieMapper;
import com.stockpro.repository.stock.ArticleRepository;
import com.stockpro.repository.stock.CategorieRepository;
import com.stockpro.service.stock.CategorieService;
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
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;
    private final ArticleRepository articleRepository;
    private final CategorieMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategorieDTO> findAll() {
        return categorieRepository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategorieDTO> findAll(Pageable pageable) {
        return categorieRepository.findAll(pageable).map(this::toDtoEnrichi);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategorieDTO> search(String query, Pageable pageable) {
        return categorieRepository
                .findByNomCategorieContainingIgnoreCaseOrCodeCategorieContainingIgnoreCase(query, query, pageable)
                .map(this::toDtoEnrichi);
    }

    @Override
    @Transactional(readOnly = true)
    public CategorieDTO findById(UUID id) {
        return toDtoEnrichi(getEntity(id));
    }

    @Override
    public CategorieDTO create(CategorieDTO dto) {
        if (categorieRepository.findByCodeCategorie(dto.getCodeCategorie()).isPresent()) {
            throw new BusinessException("Une catégorie avec ce code existe déjà");
        }
        Categorie categorie = mapper.toEntity(dto);
        categorie.setIdCategorie(null);
        return mapper.toDto(categorieRepository.save(categorie));
    }

    @Override
    public CategorieDTO update(UUID id, CategorieDTO dto) {
        Categorie existing = getEntity(id);
        existing.setCodeCategorie(dto.getCodeCategorie());
        existing.setNomCategorie(dto.getNomCategorie());
        existing.setDescription(dto.getDescription());
        return mapper.toDto(categorieRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        Categorie categorie = getEntity(id);
        if (!categorie.getArticles().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une catégorie utilisée par des articles");
        }
        categorieRepository.delete(categorie);
    }

    private Categorie getEntity(UUID id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
    }

    private CategorieDTO toDtoEnrichi(Categorie entity) {
        CategorieDTO dto = mapper.toDto(entity);
        dto.setNombreArticles((long) entity.getArticles().size());
        return dto;
    }
}
