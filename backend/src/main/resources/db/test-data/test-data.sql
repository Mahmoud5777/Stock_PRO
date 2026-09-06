-- =====================================================================
-- StockPro — Test / demo data seed script
-- =====================================================================
-- Purpose : populate a realistic dataset across every module so the
-- application can be exercised end-to-end (search, filters, permissions,
-- low-stock alerts, movement history, inventory, access audit...).
--
-- This is NOT a Flyway migration — run it manually, once, on a dev/test
-- database, after the application has started at least once (so V1-V6
-- have already created the schema and the base SUPERADMIN account):
--
--   psql -U postgres -d gestion_stock -f test-data.sql
--
-- The script is fully idempotent: every INSERT is guarded so running it
-- several times never creates duplicates.
--
-- Test users (all created here, password for every one: ChangeMoi@2026):
--   sarah.benali   — Stock Manager profile, site: Warehouse North
--   karim.trabelsi — Stock Manager profile, site: Warehouse North
--   amine.gharbi   — Superadmin profile,   site: Head Office
--   nadia.bouazizi — Viewer profile,       site: Head Office
--   yassine.chaabane — Cashier role + Viewer profile, site: Downtown Store
--   mohamed.sassi  — Stock Manager profile, site: Lake Store
--   leila.jendoubi — Viewer profile (inactive account), site: Head Office
--   omar.riahi     — Auditor role,         site: Warehouse South
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Same bcrypt hash as the seeded admin.temp account (V3) → password "ChangeMoi@2026" for every test user below.
-- (Never store a plaintext password; this hash is generated the same way Spring Security's BCryptPasswordEncoder does.)

/*==============================================================*/
/* 1. SITES                                                      */
/*==============================================================*/
INSERT INTO SITE (ID_SITE, COD_SITE, LIB_SITE, DESCRIPTION, ADDRESS, SIT_ID_SITE)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID,
       v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION, v.address::DESCRIPTION,
       CASE WHEN v.parent_code IS NULL THEN NULL
            ELSE (SELECT ID_SITE FROM SITE WHERE COD_SITE = v.parent_code::CODE) END
FROM (VALUES
    ('ENTREPOT-NORD', 'Warehouse North', 'Main receiving warehouse, northern region', '12 Industrial Ave, Bizerte', NULL),
    ('ENTREPOT-SUD',  'Warehouse South', 'Secondary warehouse, southern region', '45 Logistics Rd, Sfax', NULL),
    ('BOUTIQUE-CV',   'Downtown Store', 'Retail store, city center', '3 Habib Bourguiba Ave, Tunis', 'SIEGE'),
    ('BOUTIQUE-LAC',  'Lake Store', 'Retail store, Lac district', '27 Lake Business Park, Tunis', 'SIEGE')
) AS v(code, libelle, description, address, parent_code)
WHERE NOT EXISTS (SELECT 1 FROM SITE WHERE COD_SITE = v.code::CODE);

/*==============================================================*/
/* 2. ROLES                                                      */
/*==============================================================*/
INSERT INTO ROLE (ID_RL, COD_ROLE, LIB_ROLE, DESCRIPTION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION
FROM (VALUES
    ('CASHIER',  'Cashier',        'Handles point-of-sale stock outflows'),
    ('WAREHOUSE','Warehouse Clerk','Receives and dispatches stock at a warehouse'),
    ('AUDITOR',  'Auditor',        'Read-only oversight of access logs and reports')
) AS v(code, libelle, description)
WHERE NOT EXISTS (SELECT 1 FROM ROLE WHERE COD_ROLE = v.code::CODE);

/*==============================================================*/
/* 3. PROFILES + their rights                                    */
/*==============================================================*/
INSERT INTO PROFIL (ID_PR, COD_PROFIL, LIB_PROFIL, DESCRIPTION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION
FROM (VALUES
    ('STOCK_MANAGER', 'Stock Manager', 'Full access to the stock module (articles, movements, inventory, reports)'),
    ('VIEWER',        'Viewer',        'Read-only access to every module')
) AS v(code, libelle, description)
WHERE NOT EXISTS (SELECT 1 FROM PROFIL WHERE COD_PROFIL = v.code::CODE);

-- Stock Manager: full CRUD + export on stock features only.
INSERT INTO PROFIL_DROIT (ID_PROFIL_DROIT, ID_PR, ID_FONCTIONNALITE,
                          F_CONSULTATION, F_AJOUT, F_MODIFICATION, F_SUPPRESSION, F_IMPRESSION, F_EXPORT)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, p.ID_PR, f.ID_FONCTIONNALITE,
       TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM PROFIL p
JOIN FONCTIONNALITE f ON f.COD_FONCTIONNALITE IN (
    'ARTICLES'::CODE, 'CATEGORIES'::CODE, 'FOURNISSEURS'::CODE,
    'ENTREES_STOCK'::CODE, 'SORTIES_STOCK'::CODE, 'INVENTAIRE'::CODE, 'RAPPORTS'::CODE
)
WHERE p.COD_PROFIL = 'STOCK_MANAGER'
  AND NOT EXISTS (SELECT 1 FROM PROFIL_DROIT pd WHERE pd.ID_PR = p.ID_PR AND pd.ID_FONCTIONNALITE = f.ID_FONCTIONNALITE);

-- Viewer: read-only (consultation) on every feature.
INSERT INTO PROFIL_DROIT (ID_PROFIL_DROIT, ID_PR, ID_FONCTIONNALITE,
                          F_CONSULTATION, F_AJOUT, F_MODIFICATION, F_SUPPRESSION, F_IMPRESSION, F_EXPORT)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, p.ID_PR, f.ID_FONCTIONNALITE,
       TRUE, FALSE, FALSE, FALSE, FALSE, FALSE
FROM PROFIL p
JOIN FONCTIONNALITE f ON TRUE
WHERE p.COD_PROFIL = 'VIEWER'
  AND NOT EXISTS (SELECT 1 FROM PROFIL_DROIT pd WHERE pd.ID_PR = p.ID_PR AND pd.ID_FONCTIONNALITE = f.ID_FONCTIONNALITE);

/*==============================================================*/
/* 4. GROUPS (bundle profiles + roles)                            */
/*==============================================================*/
INSERT INTO GROUPE (ID_GR, COD_GROUPE, LIB_GROUPE, DESCRIPTION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION
FROM (VALUES
    ('STORE_STAFF', 'Store Staff', 'Cashiers combined with read-only reporting access'),
    ('AUDIT_TEAM',  'Audit Team',  'Auditors with read-only access across the app')
) AS v(code, libelle, description)
WHERE NOT EXISTS (SELECT 1 FROM GROUPE WHERE COD_GROUPE = v.code::CODE);

INSERT INTO GROUPE_PROFIL (ID_GROUPE_PROFIL, ID_GR, ID_PR, F_ACTIF, DAT_CREATION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, g.ID_GR, p.ID_PR, TRUE, CURRENT_DATE
FROM GROUPE g, PROFIL p
WHERE g.COD_GROUPE = 'STORE_STAFF' AND p.COD_PROFIL = 'VIEWER'
  AND NOT EXISTS (SELECT 1 FROM GROUPE_PROFIL gp WHERE gp.ID_GR = g.ID_GR AND gp.ID_PR = p.ID_PR);

INSERT INTO GROUPE_ROLE (ID_GROUPE_ROLE, ID_RL, ID_GR, F_ACTIF, DAT_CREATION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, r.ID_RL, g.ID_GR, TRUE, CURRENT_DATE
FROM GROUPE g, ROLE r
WHERE g.COD_GROUPE = 'STORE_STAFF' AND r.COD_ROLE = 'CASHIER'
  AND NOT EXISTS (SELECT 1 FROM GROUPE_ROLE gr WHERE gr.ID_GR = g.ID_GR AND gr.ID_RL = r.ID_RL);

INSERT INTO GROUPE_PROFIL (ID_GROUPE_PROFIL, ID_GR, ID_PR, F_ACTIF, DAT_CREATION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, g.ID_GR, p.ID_PR, TRUE, CURRENT_DATE
FROM GROUPE g, PROFIL p
WHERE g.COD_GROUPE = 'AUDIT_TEAM' AND p.COD_PROFIL = 'VIEWER'
  AND NOT EXISTS (SELECT 1 FROM GROUPE_PROFIL gp WHERE gp.ID_GR = g.ID_GR AND gp.ID_PR = p.ID_PR);

INSERT INTO GROUPE_ROLE (ID_GROUPE_ROLE, ID_RL, ID_GR, F_ACTIF, DAT_CREATION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, r.ID_RL, g.ID_GR, TRUE, CURRENT_DATE
FROM GROUPE g, ROLE r
WHERE g.COD_GROUPE = 'AUDIT_TEAM' AND r.COD_ROLE = 'AUDITOR'
  AND NOT EXISTS (SELECT 1 FROM GROUPE_ROLE gr WHERE gr.ID_GR = g.ID_GR AND gr.ID_RL = r.ID_RL);

/*==============================================================*/
/* 5. USERS                                                       */
/*==============================================================*/
INSERT INTO UTILISATEUR (ID_UTIL, NOM_COMPLET, LOGIN, MOT_PASSE, EMAIL, TELEPHONE, ETAT_COMPTE, DATE_CREATION, DOIT_CHANGER_MDP)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID,
       v.nom::NOM_COMPLET, v.login::LOGIN,
       '$2b$10$sEOXkc/0ZILS15jUyvJvduMThqbuxJImCT.Ewkrn7hE51ux4.EJiO'::MOTDEPASSE,
       v.email::EMAIL, v.telephone::VARCHAR(20), v.actif, (CURRENT_DATE - (v.jours_anciennete || ' days')::interval), FALSE
FROM (VALUES
    ('Sarah Ben Ali',     'sarah.benali',     'sarah.benali@stockpro.local',     '+216 20 111 222', TRUE,  120),
    ('Karim Trabelsi',    'karim.trabelsi',   'karim.trabelsi@stockpro.local',   '+216 20 222 333', TRUE,  95),
    ('Amine Gharbi',      'amine.gharbi',     'amine.gharbi@stockpro.local',     '+216 20 333 444', TRUE,  200),
    ('Nadia Bouazizi',    'nadia.bouazizi',   'nadia.bouazizi@stockpro.local',   '+216 20 444 555', TRUE,  60),
    ('Yassine Chaabane',  'yassine.chaabane', 'yassine.chaabane@stockpro.local', '+216 20 555 666', TRUE,  45),
    ('Mohamed Sassi',     'mohamed.sassi',    'mohamed.sassi@stockpro.local',    '+216 20 666 777', TRUE,  30),
    ('Leila Jendoubi',    'leila.jendoubi',   'leila.jendoubi@stockpro.local',   '+216 20 777 888', FALSE, 15),
    ('Omar Riahi',        'omar.riahi',       'omar.riahi@stockpro.local',       '+216 20 888 999', TRUE,  10)
) AS v(nom, login, email, telephone, actif, jours_anciennete)
WHERE NOT EXISTS (SELECT 1 FROM UTILISATEUR WHERE LOGIN = v.login::LOGIN);

/*==============================================================*/
/* 6. USER <-> SITE assignments, then USER_SITE <-> rights        */
/*==============================================================*/
INSERT INTO USER_SITE (ID_UTIL_SITE, ID_SITE, ID_UTIL, DAT_AFFECTATION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, s.ID_SITE, u.ID_UTIL, CURRENT_DATE
FROM (VALUES
    ('sarah.benali',     'ENTREPOT-NORD'),
    ('karim.trabelsi',   'ENTREPOT-NORD'),
    ('amine.gharbi',     'SIEGE'),
    ('nadia.bouazizi',   'SIEGE'),
    ('yassine.chaabane', 'BOUTIQUE-CV'),
    ('mohamed.sassi',    'BOUTIQUE-LAC'),
    ('leila.jendoubi',   'SIEGE'),
    ('omar.riahi',       'ENTREPOT-SUD')
) AS v(login, site_code)
JOIN UTILISATEUR u ON u.LOGIN = v.login::LOGIN
JOIN SITE s ON s.COD_SITE = v.site_code::CODE
WHERE NOT EXISTS (SELECT 1 FROM USER_SITE us WHERE us.ID_UTIL = u.ID_UTIL AND us.ID_SITE = s.ID_SITE);

-- Profile assignments (Stock Manager / Superadmin / Viewer)
INSERT INTO USER_SITE_DROITS (ID_USER_SITE_DROIT, ID_UTIL_SITE, ID_PR)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, us.ID_UTIL_SITE, p.ID_PR
FROM (VALUES
    ('sarah.benali',   'ENTREPOT-NORD', 'STOCK_MANAGER'),
    ('karim.trabelsi', 'ENTREPOT-NORD', 'STOCK_MANAGER'),
    ('amine.gharbi',   'SIEGE',         'SUPERADMIN'),
    ('nadia.bouazizi', 'SIEGE',         'VIEWER'),
    ('mohamed.sassi',  'BOUTIQUE-LAC',  'STOCK_MANAGER'),
    ('leila.jendoubi', 'SIEGE',         'VIEWER')
) AS v(login, site_code, profil_code)
JOIN UTILISATEUR u ON u.LOGIN = v.login::LOGIN
JOIN SITE s ON s.COD_SITE = v.site_code::CODE
JOIN USER_SITE us ON us.ID_UTIL = u.ID_UTIL AND us.ID_SITE = s.ID_SITE
JOIN PROFIL p ON p.COD_PROFIL = v.profil_code::CODE
WHERE NOT EXISTS (SELECT 1 FROM USER_SITE_DROITS d WHERE d.ID_UTIL_SITE = us.ID_UTIL_SITE AND d.ID_PR = p.ID_PR);

-- Group assignment: Yassine (cashier) via the Store Staff group
INSERT INTO USER_SITE_DROITS (ID_USER_SITE_DROIT, ID_UTIL_SITE, ID_GR)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, us.ID_UTIL_SITE, g.ID_GR
FROM UTILISATEUR u
JOIN SITE s ON s.COD_SITE = 'BOUTIQUE-CV'::CODE
JOIN USER_SITE us ON us.ID_UTIL = u.ID_UTIL AND us.ID_SITE = s.ID_SITE
JOIN GROUPE g ON g.COD_GROUPE = 'STORE_STAFF'::CODE
WHERE u.LOGIN = 'yassine.chaabane'::LOGIN
  AND NOT EXISTS (SELECT 1 FROM USER_SITE_DROITS d WHERE d.ID_UTIL_SITE = us.ID_UTIL_SITE AND d.ID_GR = g.ID_GR);

-- Role assignment: Omar (auditor) directly via role
INSERT INTO USER_SITE_DROITS (ID_USER_SITE_DROIT, ID_UTIL_SITE, ID_RL)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, us.ID_UTIL_SITE, r.ID_RL
FROM UTILISATEUR u
JOIN SITE s ON s.COD_SITE = 'ENTREPOT-SUD'::CODE
JOIN USER_SITE us ON us.ID_UTIL = u.ID_UTIL AND us.ID_SITE = s.ID_SITE
JOIN ROLE r ON r.COD_ROLE = 'AUDITOR'::CODE
WHERE u.LOGIN = 'omar.riahi'::LOGIN
  AND NOT EXISTS (SELECT 1 FROM USER_SITE_DROITS d WHERE d.ID_UTIL_SITE = us.ID_UTIL_SITE AND d.ID_RL = r.ID_RL);

/*==============================================================*/
/* 7. CATEGORIES                                                  */
/*==============================================================*/
INSERT INTO CATEGORIE (ID_CATEGORIE, COD_CATEGORIE, LIB_CATEGORIE, DESCRIPTION)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION
FROM (VALUES
    ('BEVERAGES',  'Beverages',            'Soft drinks, juices, water, coffee, tea'),
    ('SNACKS',     'Snacks & Confectionery','Chips, biscuits, chocolate, candy'),
    ('DAIRY',      'Dairy Products',        'Milk, cheese, yogurt'),
    ('ELECTRONICS','Electronics',           'Small electronics and accessories'),
    ('OFFICE',     'Office Supplies',       'Stationery and office equipment'),
    ('CLEANING',   'Cleaning Supplies',     'Detergents, cleaning tools'),
    ('BAKERY',     'Bakery',                'Bread, pastries, cakes'),
    ('FROZEN',     'Frozen Foods',          'Frozen meals and ingredients')
) AS v(code, libelle, description)
WHERE NOT EXISTS (SELECT 1 FROM CATEGORIE WHERE COD_CATEGORIE = v.code::CODE);

/*==============================================================*/
/* 8. SUPPLIERS                                                   */
/*==============================================================*/
INSERT INTO FOURNISSEUR (ID_FOURNISSEUR, COD_FOURNISSEUR, LIB_FOURNISSEUR, CONTACT, TELEPHONE, EMAIL, ADRESSE)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.contact::VARCHAR(150),
       v.telephone::VARCHAR(20), v.email::EMAIL, v.adresse::TEXT
FROM (VALUES
    ('GLOBALFOOD', 'Global Foods Distribution', 'Hana Meddeb',   '+216 71 100 200', 'contact@globalfoods.example', 'Zone Industrielle, Ben Arous'),
    ('TECHSOURCE', 'TechSource Wholesale',      'Fares Bouzid',  '+216 71 200 300', 'sales@techsource.example',    '18 Tech Park, Ariana'),
    ('CLEANPRO',   'CleanPro Supplies',         'Ines Kallel',   '+216 71 300 400', 'orders@cleanpro.example',     'Route de Sfax km 5, Sousse'),
    ('FRESHDAIRY', 'Fresh Dairy Co.',           'Walid Amri',    '+216 71 400 500', 'info@freshdairy.example',     '9 Rue des Fermes, Béja'),
    ('OFFICEESS',  'Office Essentials Ltd.',    'Rania Cherni',  '+216 71 500 600', 'hello@officeessentials.example', '4 Business Center, Tunis'),
    ('SNACKMAST',  'Snack Masters Inc.',        'Bilel Neji',    '+216 71 600 700', 'contact@snackmasters.example',  '22 Food Court Ave, Nabeul')
) AS v(code, libelle, contact, telephone, email, adresse)
WHERE NOT EXISTS (SELECT 1 FROM FOURNISSEUR WHERE COD_FOURNISSEUR = v.code::CODE);

/*==============================================================*/
/* 9. ARTICLES                                                    */
/*==============================================================*/
INSERT INTO ARTICLE (ID_ARTICLE, COD_ARTICLE, LIB_ARTICLE, DESCRIPTION, UNITE, PRIX_ACHAT, PRIX_VENTE, SEUIL_ALERTE, F_ACTIF, ID_CATEGORIE, ID_FOURNISSEUR)
SELECT REPLACE(gen_random_uuid()::text, '-', '')::ID, v.code::CODE, v.libelle::LIBELLE, v.description::DESCRIPTION,
       v.unite::VARCHAR(20), v.prix_achat::NUMERIC(14,3), v.prix_vente::NUMERIC(14,3), v.seuil::NUMERIC(14,3), v.actif,
       (SELECT ID_CATEGORIE FROM CATEGORIE WHERE COD_CATEGORIE = v.cat_code::CODE),
       (SELECT ID_FOURNISSEUR FROM FOURNISSEUR WHERE COD_FOURNISSEUR = v.four_code::CODE)
FROM (VALUES
    ('ART-BEV-001', 'Arabica Coffee 1kg',        'Roasted whole beans',        'unit', 12.500, 19.900, 10, TRUE,  'BEVERAGES',  'GLOBALFOOD'),
    ('ART-BEV-002', 'Orange Juice 1L',           'Freshly squeezed',           'unit', 2.200,  3.900,  20, TRUE,  'BEVERAGES',  'FRESHDAIRY'),
    ('ART-BEV-003', 'Sparkling Water 500ml',     'Carbonated mineral water',   'unit', 0.600,  1.200,  50, TRUE,  'BEVERAGES',  'GLOBALFOOD'),
    ('ART-BEV-004', 'Green Tea Box (20 bags)',   'Organic green tea',          'unit', 3.100,  5.500,  15, TRUE,  'BEVERAGES',  'GLOBALFOOD'),
    ('ART-SNK-001', 'Potato Chips 150g',         'Salted, family pack',        'unit', 1.400,  2.500,  30, TRUE,  'SNACKS',     'SNACKMAST'),
    ('ART-SNK-002', 'Dark Chocolate Bar 100g',   '70% cocoa',                  'unit', 2.000,  3.700,  25, TRUE,  'SNACKS',     'SNACKMAST'),
    ('ART-SNK-003', 'Butter Cookies 300g',       'Traditional recipe',         'unit', 2.800,  4.900,  10, TRUE,  'SNACKS',     'SNACKMAST'),
    ('ART-DAI-001', 'Whole Milk 1L',             'Pasteurized',                'unit', 1.100,  1.800,  40, TRUE,  'DAIRY',      'FRESHDAIRY'),
    ('ART-DAI-002', 'Greek Yogurt 500g',         'Natural, high protein',      'unit', 2.500,  4.200,  15, TRUE,  'DAIRY',      'FRESHDAIRY'),
    ('ART-DAI-003', 'Cheddar Cheese 200g',       'Aged 6 months',              'unit', 4.600,  7.900,  8,  TRUE,  'DAIRY',      'FRESHDAIRY'),
    ('ART-ELE-001', 'USB-C Cable 1m',            'Fast charging, braided',     'unit', 3.500,  7.900,  20, TRUE,  'ELECTRONICS','TECHSOURCE'),
    ('ART-ELE-002', 'Wireless Mouse',            'Ergonomic, 2.4GHz',          'unit', 9.000,  18.900, 10, TRUE,  'ELECTRONICS','TECHSOURCE'),
    ('ART-ELE-003', 'Power Bank 10000mAh',       'Dual USB output',            'unit', 15.000, 29.900, 5,  TRUE,  'ELECTRONICS','TECHSOURCE'),
    ('ART-ELE-004', 'Bluetooth Speaker',         'Portable, waterproof',       'unit', 22.000, 39.900, 5,  FALSE, 'ELECTRONICS','TECHSOURCE'),
    ('ART-OFF-001', 'A4 Paper Ream (500 sheets)','80gsm, white',               'unit', 5.200,  8.500,  30, TRUE,  'OFFICE',     'OFFICEESS'),
    ('ART-OFF-002', 'Ballpoint Pens (Box of 50)','Blue ink',                   'box',  6.000,  10.500, 10, TRUE,  'OFFICE',     'OFFICEESS'),
    ('ART-OFF-003', 'Stapler Heavy Duty',        'Up to 50 sheets',            'unit', 4.800,  8.900,  8,  TRUE,  'OFFICE',     'OFFICEESS'),
    ('ART-CLE-001', 'Multi-Surface Cleaner 1L',  'Antibacterial',              'unit', 2.700,  4.600,  20, TRUE,  'CLEANING',   'CLEANPRO'),
    ('ART-CLE-002', 'Dish Soap 750ml',           'Lemon scent',                'unit', 1.900,  3.300,  25, TRUE,  'CLEANING',   'CLEANPRO'),
    ('ART-CLE-003', 'Microfiber Cloths (Pack 5)','Reusable',                   'pack', 3.400,  6.200,  15, TRUE,  'CLEANING',   'CLEANPRO'),
    ('ART-BAK-001', 'Baguette',                  'Freshly baked daily',        'unit', 0.350,  0.700,  50, TRUE,  'BAKERY',     'GLOBALFOOD'),
    ('ART-BAK-002', 'Croissant',                 'Butter croissant',           'unit', 0.500,  1.100,  30, TRUE,  'BAKERY',     'GLOBALFOOD'),
    ('ART-FRZ-001', 'Frozen Pizza Margherita',   'Ready to bake',              'unit', 3.900,  6.900,  12, TRUE,  'FROZEN',     'GLOBALFOOD'),
    ('ART-FRZ-002', 'Frozen Mixed Vegetables 1kg','Peas, carrots, corn',       'unit', 2.300,  4.100,  15, TRUE,  'FROZEN',     'GLOBALFOOD'),
    ('ART-FRZ-003', 'Ice Cream Vanilla 1L',      'Classic vanilla',            'unit', 4.500,  7.900,  10, TRUE,  'FROZEN',     'FRESHDAIRY')
) AS v(code, libelle, description, unite, prix_achat, prix_vente, seuil, actif, cat_code, four_code)
WHERE NOT EXISTS (SELECT 1 FROM ARTICLE WHERE COD_ARTICLE = v.code::CODE);

/*==============================================================*/
/* 10. STOCK MOVEMENT HISTORY (drives STOCK_SITE quantities)      */
/*     For each article, generate a random history of stock-in / */
/*     stock-out movements over the last 12 months at 1-3 sites, */
/*     then derive the final on-hand quantity for STOCK_SITE.    */
/*==============================================================*/
DO $$
DECLARE
    art RECORD;
    site_row RECORD;
    site_codes TEXT[] := ARRAY['SIEGE', 'ENTREPOT-NORD', 'ENTREPOT-SUD', 'BOUTIQUE-CV', 'BOUTIQUE-LAC'];
    chosen_sites TEXT[];
    site_code TEXT;
    nb_sites INT;
    nb_mouvements INT;
    running_qty NUMERIC(14,3);
    mvt_qty NUMERIC(14,3);
    mvt_type TEXT;
    mvt_date TIMESTAMP;
    user_ids UUID[];
    chosen_user TEXT;
    i INT;
    v_id_article ID;
    v_id_site ID;
    v_id_util ID;
BEGIN
    -- Skip entirely if this script has already been run (movements already exist).
    IF EXISTS (SELECT 1 FROM MOUVEMENT_STOCK LIMIT 1) THEN
        RAISE NOTICE 'MOUVEMENT_STOCK already has data — skipping movement generation.';
        RETURN;
    END IF;

    FOR art IN SELECT ID_ARTICLE, COD_ARTICLE FROM ARTICLE LOOP
        -- Each article is stocked at 2 or 3 randomly chosen sites.
        nb_sites := 2 + floor(random() * 2)::INT;
        chosen_sites := (
            SELECT ARRAY(SELECT unnest(site_codes) ORDER BY random() LIMIT nb_sites)
        );

        FOREACH site_code IN ARRAY chosen_sites LOOP
            v_id_article := art.ID_ARTICLE;
            SELECT ID_SITE INTO v_id_site FROM SITE WHERE COD_SITE = site_code::CODE;

            running_qty := 0;
            nb_mouvements := 3 + floor(random() * 6)::INT; -- 3 to 8 movements per article/site

            FOR i IN 1..nb_mouvements LOOP
                mvt_date := now() - (floor(random() * 365)::TEXT || ' days')::interval
                                   - (floor(random() * 24)::TEXT || ' hours')::interval;

                -- Pick a random active user to attribute the movement to.
                SELECT ID_UTIL INTO v_id_util FROM UTILISATEUR ORDER BY random() LIMIT 1;

                -- First movement for a given article/site is always a stock-in (can't sell what you don't have).
                IF i = 1 OR random() < 0.6 THEN
                    mvt_type := 'ENTREE';
                    mvt_qty := round((10 + random() * 90)::numeric, 0);
                ELSE
                    mvt_type := 'SORTIE';
                    mvt_qty := round((least(running_qty, 5 + random() * 40))::numeric, 0);
                    IF mvt_qty <= 0 THEN
                        CONTINUE; -- nothing to sell yet, skip this iteration
                    END IF;
                END IF;

                INSERT INTO MOUVEMENT_STOCK (ID_MOUVEMENT, ID_ARTICLE, ID_SITE, ID_UTIL, TYPE_MOUVEMENT,
                                              QUANTITE, QUANTITE_AVANT, QUANTITE_APRES, MOTIF, REFERENCE_DOC, DATE_MOUVEMENT)
                VALUES (
                    REPLACE(gen_random_uuid()::text, '-', '')::ID,
                    v_id_article, v_id_site, v_id_util, mvt_type,
                    mvt_qty, running_qty,
                    CASE WHEN mvt_type = 'ENTREE' THEN running_qty + mvt_qty ELSE running_qty - mvt_qty END,
                    CASE WHEN mvt_type = 'ENTREE' THEN 'Supplier delivery' ELSE 'Store sale' END,
                    CASE WHEN mvt_type = 'ENTREE'
                         THEN 'PO-' || to_char(mvt_date, 'YYYYMMDD') || '-' || floor(random()*900+100)::text
                         ELSE 'SALE-' || to_char(mvt_date, 'YYYYMMDD') || '-' || floor(random()*900+100)::text
                    END,
                    mvt_date
                );

                running_qty := CASE WHEN mvt_type = 'ENTREE' THEN running_qty + mvt_qty ELSE running_qty - mvt_qty END;
            END LOOP;

            -- Final on-hand quantity for this article/site, derived from the movement history above.
            INSERT INTO STOCK_SITE (ID_STOCK_SITE, ID_ARTICLE, ID_SITE, QUANTITE)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, v_id_article, v_id_site, running_qty)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

/*==============================================================*/
/* 11. SAMPLE INVENTORIES                                         */
/*==============================================================*/
DO $$
DECLARE
    v_id_inventaire_closed ID;
    v_id_inventaire_open ID;
    v_id_site_siege ID;
    v_id_site_nord ID;
    v_id_user ID;
    art RECORD;
    theorique NUMERIC(14,3);
    ecart_choice NUMERIC(14,3);
BEGIN
    IF EXISTS (SELECT 1 FROM INVENTAIRE LIMIT 1) THEN
        RAISE NOTICE 'INVENTAIRE already has data — skipping inventory generation.';
        RETURN;
    END IF;

    SELECT ID_SITE INTO v_id_site_siege FROM SITE WHERE COD_SITE = 'SIEGE'::CODE;
    SELECT ID_SITE INTO v_id_site_nord FROM SITE WHERE COD_SITE = 'ENTREPOT-NORD'::CODE;
    SELECT ID_UTIL INTO v_id_user FROM UTILISATEUR WHERE LOGIN = 'amine.gharbi'::LOGIN;

    -- Closed inventory at Head Office, one month ago, with a couple of discrepancies.
    v_id_inventaire_closed := REPLACE(gen_random_uuid()::text, '-', '')::ID;
    INSERT INTO INVENTAIRE (ID_INVENTAIRE, COD_INVENTAIRE, ID_SITE, ID_UTIL, STATUT, DATE_INVENTAIRE, DATE_CLOTURE)
    VALUES (v_id_inventaire_closed, ('INV-' || to_char(now() - interval '30 days', 'YYYYMMDDHH24MISS'))::CODE,
            v_id_site_siege, v_id_user, 'CLOTURE', now() - interval '30 days', now() - interval '29 days');

    FOR art IN
        SELECT a.ID_ARTICLE, COALESCE(ss.QUANTITE, 0) AS qty
        FROM ARTICLE a
        LEFT JOIN STOCK_SITE ss ON ss.ID_ARTICLE = a.ID_ARTICLE AND ss.ID_SITE = v_id_site_siege
    LOOP
        theorique := art.qty;
        -- ~20% chance of a small discrepancy to make the demo realistic.
        IF random() < 0.2 THEN
            ecart_choice := round((random() * 6 - 3)::numeric, 0); -- -3..+3
        ELSE
            ecart_choice := 0;
        END IF;
        INSERT INTO INVENTAIRE_LIGNE (ID_LIGNE, ID_INVENTAIRE, ID_ARTICLE, QUANTITE_THEORIQUE, QUANTITE_PHYSIQUE, ECART)
        VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, v_id_inventaire_closed, art.ID_ARTICLE,
                theorique, GREATEST(theorique + ecart_choice, 0), ecart_choice);
    END LOOP;

    -- Open inventory at Warehouse North, started yesterday, partially counted.
    v_id_inventaire_open := REPLACE(gen_random_uuid()::text, '-', '')::ID;
    INSERT INTO INVENTAIRE (ID_INVENTAIRE, COD_INVENTAIRE, ID_SITE, ID_UTIL, STATUT, DATE_INVENTAIRE, DATE_CLOTURE)
    VALUES (v_id_inventaire_open, ('INV-' || to_char(now() - interval '1 days', 'YYYYMMDDHH24MISS'))::CODE,
            v_id_site_nord, v_id_user, 'EN_COURS', now() - interval '1 days', NULL);

    FOR art IN
        SELECT a.ID_ARTICLE, COALESCE(ss.QUANTITE, 0) AS qty, row_number() OVER () AS rn
        FROM ARTICLE a
        LEFT JOIN STOCK_SITE ss ON ss.ID_ARTICLE = a.ID_ARTICLE AND ss.ID_SITE = v_id_site_nord
    LOOP
        -- Only the first half of the articles have been counted so far (open inventory).
        IF art.rn % 2 = 0 THEN
            INSERT INTO INVENTAIRE_LIGNE (ID_LIGNE, ID_INVENTAIRE, ID_ARTICLE, QUANTITE_THEORIQUE, QUANTITE_PHYSIQUE, ECART)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, v_id_inventaire_open, art.ID_ARTICLE, art.qty, art.qty, 0);
        ELSE
            INSERT INTO INVENTAIRE_LIGNE (ID_LIGNE, ID_INVENTAIRE, ID_ARTICLE, QUANTITE_THEORIQUE, QUANTITE_PHYSIQUE, ECART)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, v_id_inventaire_open, art.ID_ARTICLE, art.qty, NULL, NULL);
        END IF;
    END LOOP;
END $$;

/*==============================================================*/
/* 12. ACCESS AUDIT LOG SAMPLES                                   */
/*==============================================================*/
DO $$
DECLARE
    logins TEXT[] := ARRAY['amine.gharbi', 'sarah.benali', 'karim.trabelsi', 'nadia.bouazizi', 'yassine.chaabane', 'mohamed.sassi', 'unknown.user'];
    ips TEXT[] := ARRAY['41.226.12.10', '197.14.55.201', '105.99.3.44', '41.229.87.6', '197.15.201.9'];
    endpoints TEXT[] := ARRAY['/api/articles', '/api/mouvements-stock/entrees', '/api/inventaires', '/api/rapports/synthese', '/api/users'];
    chosen_login TEXT;
    i INT;
    r NUMERIC;
    log_date TIMESTAMP;
BEGIN
    IF EXISTS (SELECT 1 FROM LOG_ACCES LIMIT 1) THEN
        RAISE NOTICE 'LOG_ACCES already has data — skipping audit log generation.';
        RETURN;
    END IF;

    FOR i IN 1..40 LOOP
        chosen_login := logins[1 + floor(random() * array_length(logins, 1))::INT];
        log_date := now() - (floor(random() * 30)::TEXT || ' days')::interval - (floor(random() * 24)::TEXT || ' hours')::interval;
        r := random();

        IF chosen_login = 'unknown.user' OR r < 0.12 THEN
            INSERT INTO LOG_ACCES (ID_LOG, LOGIN, ACTION, METHODE_HTTP, ENDPOINT, STATUT_HTTP, ADRESSE_IP, DATE_ACCES)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, chosen_login, 'LOGIN_FAILURE', 'POST', '/api/auth/login', 401,
                    ips[1 + floor(random() * array_length(ips, 1))::INT], log_date);
        ELSIF r < 0.35 THEN
            INSERT INTO LOG_ACCES (ID_LOG, LOGIN, ACTION, METHODE_HTTP, ENDPOINT, STATUT_HTTP, ADRESSE_IP, DATE_ACCES)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, chosen_login, 'LOGIN_SUCCESS', 'POST', '/api/auth/login', 200,
                    ips[1 + floor(random() * array_length(ips, 1))::INT], log_date);
        ELSIF r < 0.45 THEN
            INSERT INTO LOG_ACCES (ID_LOG, LOGIN, ACTION, METHODE_HTTP, ENDPOINT, STATUT_HTTP, ADRESSE_IP, DATE_ACCES)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, chosen_login, 'LOGOUT', 'POST', '/api/auth/logout', 200,
                    ips[1 + floor(random() * array_length(ips, 1))::INT], log_date);
        ELSIF r < 0.55 THEN
            INSERT INTO LOG_ACCES (ID_LOG, LOGIN, ACTION, METHODE_HTTP, ENDPOINT, STATUT_HTTP, ADRESSE_IP, DATE_ACCES)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, chosen_login, 'REFRESH_TOKEN', 'POST', '/api/auth/refresh', 200,
                    ips[1 + floor(random() * array_length(ips, 1))::INT], log_date);
        ELSE
            INSERT INTO LOG_ACCES (ID_LOG, LOGIN, ACTION, METHODE_HTTP, ENDPOINT, STATUT_HTTP, ADRESSE_IP, DATE_ACCES)
            VALUES (REPLACE(gen_random_uuid()::text, '-', '')::ID, chosen_login, 'ACCES_API', 'GET',
                    endpoints[1 + floor(random() * array_length(endpoints, 1))::INT], 200,
                    ips[1 + floor(random() * array_length(ips, 1))::INT], log_date);
        END IF;
    END LOOP;
END $$;

-- =====================================================================
-- Done. Summary of what was inserted (0 rows for a table means it
-- already had data before this script ran, or nothing matched — safe).
-- =====================================================================
SELECT 'Sites'         AS table_name, count(*) AS total_rows FROM SITE
UNION ALL SELECT 'Roles',        count(*) FROM ROLE
UNION ALL SELECT 'Profiles',     count(*) FROM PROFIL
UNION ALL SELECT 'Groups',       count(*) FROM GROUPE
UNION ALL SELECT 'Users',        count(*) FROM UTILISATEUR
UNION ALL SELECT 'Categories',   count(*) FROM CATEGORIE
UNION ALL SELECT 'Suppliers',    count(*) FROM FOURNISSEUR
UNION ALL SELECT 'Articles',     count(*) FROM ARTICLE
UNION ALL SELECT 'Stock lines',  count(*) FROM STOCK_SITE
UNION ALL SELECT 'Movements',    count(*) FROM MOUVEMENT_STOCK
UNION ALL SELECT 'Inventories',  count(*) FROM INVENTAIRE
UNION ALL SELECT 'Access logs',  count(*) FROM LOG_ACCES;
