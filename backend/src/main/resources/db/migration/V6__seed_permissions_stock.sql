-- =====================================================================
-- Seed : Fonctionnalités du module Stock + octroi au profil SUPERADMIN
-- Les codes ci-dessous correspondent exactement à ceux déjà déclarés
-- dans le frontend (frontend/src/features/navigation/menu.config.ts)
--
-- NB : les colonnes ID/CODE/LIBELLE reposent sur des domaines PostgreSQL
-- personnalisés (voir V1__schema_initial.sql : ID, CODE, LIBELLE...).
-- Chaque valeur littérale est castée explicitement vers le DOMAINE cible
-- lui-même (ex: ::ID, ::CODE) plutôt que vers son type de base, afin
-- d'éliminer toute ambiguïté de résolution de type par PostgreSQL.
-- =====================================================================

INSERT INTO FONCTIONNALITE (ID_FONCTIONNALITE, ID_APPLICATION, COD_FONCTIONNALITE, LIB_FONCTIONNALITE, ORDER_AFFICHAGE, F_ACTIF)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID,
       a.ID_APPLICATION,
       v.code::CODE,
       v.libelle::LIBELLE,
       v.ordre::ORDRE,
       TRUE
FROM APPLICATION a,
     (VALUES
        ('ARTICLES'::CODE,      'Articles'::LIBELLE,      10::ORDRE),
        ('CATEGORIES'::CODE,    'Catégories'::LIBELLE,    11::ORDRE),
        ('FOURNISSEURS'::CODE,  'Fournisseurs'::LIBELLE,  12::ORDRE),
        ('ENTREES_STOCK'::CODE, 'Entrées Stock'::LIBELLE, 13::ORDRE),
        ('SORTIES_STOCK'::CODE, 'Sorties Stock'::LIBELLE, 14::ORDRE),
        ('INVENTAIRE'::CODE,    'Inventaire'::LIBELLE,    15::ORDRE),
        ('RAPPORTS'::CODE,      'Rapports'::LIBELLE,      16::ORDRE)
     ) AS v(code, libelle, ordre)
WHERE a.COD_APPLICATION = 'STOCKPRO'
  AND NOT EXISTS (SELECT 1 FROM FONCTIONNALITE f WHERE f.COD_FONCTIONNALITE = v.code::CODE);

-- Octroi automatique de tous les droits sur ces nouvelles fonctionnalités
-- au profil "Super Administrateur" créé en V4.
INSERT INTO PROFIL_DROIT (ID_PROFIL_DROIT, ID_PR, ID_FONCTIONNALITE,
                          F_CONSULTATION, F_AJOUT, F_MODIFICATION, F_SUPPRESSION, F_IMPRESSION, F_EXPORT)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID,
       p.ID_PR,
       f.ID_FONCTIONNALITE,
       TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM PROFIL p
JOIN FONCTIONNALITE f ON f.COD_FONCTIONNALITE IN (
     'ARTICLES'::CODE, 'CATEGORIES'::CODE, 'FOURNISSEURS'::CODE,
     'ENTREES_STOCK'::CODE, 'SORTIES_STOCK'::CODE, 'INVENTAIRE'::CODE, 'RAPPORTS'::CODE
)
WHERE p.COD_PROFIL = 'SUPERADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM PROFIL_DROIT pd WHERE pd.ID_PR = p.ID_PR AND pd.ID_FONCTIONNALITE = f.ID_FONCTIONNALITE
  );
