package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.UserSiteDroitsDTO;

import com.stockpro.entity.administration.UserSiteDroits;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.UserSiteDroitsMapper;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.repository.administration.UserSiteDroitsRepository;
import com.stockpro.repository.administration.UserSiteRepository;
import com.stockpro.service.administration.UserSiteDroitsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSiteDroitsServiceImpl implements UserSiteDroitsService {

    private final UserSiteDroitsRepository userSiteDroitsRepository;
    private final UserSiteRepository userSiteRepository;
    private final RoleRepository roleRepository;
    private final ProfilRepository profilRepository;
    private final GroupeRepository groupeRepository;

    private final UserSiteDroitsMapper userSiteDroitsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDroitsDTO> findAll() {
        return userSiteDroitsMapper.toDto(userSiteDroitsRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSiteDroitsDTO> findAll(Pageable pageable) {
        return userSiteDroitsMapper.toDto(userSiteDroitsRepository.findAll(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public UserSiteDroitsDTO findById(UUID id) {
        return userSiteDroitsMapper.toDto(userSiteDroitsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserSiteDroits", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDroitsDTO> findByUserSite(UUID idUtilSite) {
        return userSiteDroitsMapper.toDto(userSiteDroitsRepository.findByUserSite_IdUtilSite(idUtilSite));
    }

    @Override
    public UserSiteDroitsDTO create(UserSiteDroitsDTO dto) {
        dto.setIdUserSiteDroit(null);
        resolveRelations(dto); // valide l'existence des IDs et lève une 404 claire si absents

        // On charge les VRAIES entités persistées (comme le fait déjà update()),
        // plutôt que de passer par le mapper qui crée des entités "stub" (juste l'ID posé,
        // jamais chargées depuis la base). Sans cascade sur les relations @ManyToOne,
        // Hibernate traite ces stubs comme des instances transitoires non sauvegardées
        // et lève une TransientPropertyValueException au moment du save().
        UserSiteDroits usd = UserSiteDroits.builder()
                .dateAffectation(dto.getDateAffectation())
                .userSite(userSiteRepository.findById(dto.getIdUtilSite()).orElseThrow())
                .role(dto.getIdRl() != null
                        ? roleRepository.findById(dto.getIdRl()).orElseThrow()
                        : null)
                .profil(dto.getIdPr() != null
                        ? profilRepository.findById(dto.getIdPr()).orElseThrow()
                        : null)
                .groupe(dto.getIdGr() != null
                        ? groupeRepository.findById(dto.getIdGr()).orElseThrow()
                        : null)
                .build();

        UserSiteDroits saved = userSiteDroitsRepository.save(usd);
        return userSiteDroitsMapper.toDto(saved);
    }

    @Override
    public UserSiteDroitsDTO update(UUID id, UserSiteDroitsDTO dto) {
        UserSiteDroits existing = userSiteDroitsMapper.toEntity(findById(id));

        // 1. Simple field
        existing.setDateAffectation(dto.getDateAffectation());

        // 2. Validate the IDs first
        resolveRelations(dto);

        // 3. Set the real relations from the IDs
        existing.setUserSite(
                userSiteRepository.findById(dto.getIdUtilSite()).orElseThrow()
        );

        existing.setRole(
                dto.getIdRl() != null
                        ? roleRepository.findById(dto.getIdRl()).orElseThrow()
                        : null
        );

        existing.setProfil(
                dto.getIdPr() != null
                        ? profilRepository.findById(dto.getIdPr()).orElseThrow()
                        : null
        );

        existing.setGroupe(
                dto.getIdGr() != null
                        ? groupeRepository.findById(dto.getIdGr()).orElseThrow()
                        : null
        );

        return userSiteDroitsMapper.toDto(userSiteDroitsRepository.save(existing));
    }


    @Override
    public void delete(UUID id) {
        UserSiteDroits existing = userSiteDroitsMapper.toEntity(findById(id));
        userSiteDroitsRepository.delete(existing);
    }
    private void resolveRelations(UserSiteDroitsDTO dto) {
        // UserSite is mandatory
        if (dto.getIdUtilSite() == null) {
            throw new IllegalArgumentException("Le userSite (idUtilSite) est obligatoire");
        }

        // We cannot store the entity inside the DTO (it has no such field),
        // so this method only validates that the IDs exist.
        // The real assignment is done in the update/create method.

        userSiteRepository.findById(dto.getIdUtilSite())
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", dto.getIdUtilSite()));

        if (dto.getIdRl() != null) {
            roleRepository.findById(dto.getIdRl())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", dto.getIdRl()));
        }

        if (dto.getIdPr() != null) {
            profilRepository.findById(dto.getIdPr())
                    .orElseThrow(() -> new ResourceNotFoundException("Profil", dto.getIdPr()));
        }

        if (dto.getIdGr() != null) {
            groupeRepository.findById(dto.getIdGr())
                    .orElseThrow(() -> new ResourceNotFoundException("Groupe", dto.getIdGr()));
        }
    }
}
