/*==============================================================*/
/* Module STOCK : Catégories, Fournisseurs, Articles,           */
/*                Stock par site, Mouvements, Inventaires       */
/* Convention alignée sur V1__schema_initial.sql (domaines,     */
/* ID = CHAR(32), gen_random_uuid() côté seed applicatif/SQL)   */
/*==============================================================*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

/*==============================================================*/
/* Table : CATEGORIE                                            */
/*==============================================================*/
create table CATEGORIE (
   ID_CATEGORIE         ID                   not null,
   COD_CATEGORIE        CODE                 null,
   LIB_CATEGORIE        LIBELLE              null,
   DESCRIPTION          DESCRIPTION          null,
   constraint PK_CATEGORIE primary key (ID_CATEGORIE)
);

create unique index CATEGORIE_COD_UK on CATEGORIE (COD_CATEGORIE);

/*==============================================================*/
/* Table : FOURNISSEUR                                          */
/*==============================================================*/
create table FOURNISSEUR (
   ID_FOURNISSEUR       ID                   not null,
   COD_FOURNISSEUR      CODE                 null,
   LIB_FOURNISSEUR      LIBELLE              null,
   CONTACT              VARCHAR(150)         null,
   TELEPHONE            VARCHAR(20)          null,
   EMAIL                EMAIL                null,
   ADRESSE              TEXT                 null,
   constraint PK_FOURNISSEUR primary key (ID_FOURNISSEUR)
);

create unique index FOURNISSEUR_COD_UK on FOURNISSEUR (COD_FOURNISSEUR);

/*==============================================================*/
/* Table : ARTICLE                                              */
/*==============================================================*/
create table ARTICLE (
   ID_ARTICLE           ID                   not null,
   COD_ARTICLE          CODE                 null,
   LIB_ARTICLE          LIBELLE              null,
   DESCRIPTION          DESCRIPTION          null,
   UNITE                VARCHAR(20)          null,
   PRIX_ACHAT           NUMERIC(14,3)        null,
   PRIX_VENTE           NUMERIC(14,3)        null,
   SEUIL_ALERTE         NUMERIC(14,3)        not null default 0,
   F_ACTIF              BOOLEAN              not null default true,
   ID_CATEGORIE         ID                   null,
   ID_FOURNISSEUR       ID                   null,
   constraint PK_ARTICLE primary key (ID_ARTICLE)
);

create unique index ARTICLE_COD_UK on ARTICLE (COD_ARTICLE);

alter table ARTICLE
   add constraint FK_ARTICLE_CATEGORIE foreign key (ID_CATEGORIE)
      references CATEGORIE (ID_CATEGORIE);

alter table ARTICLE
   add constraint FK_ARTICLE_FOURNISSEUR foreign key (ID_FOURNISSEUR)
      references FOURNISSEUR (ID_FOURNISSEUR);

/*==============================================================*/
/* Table : STOCK_SITE (quantité en stock d'un article par site) */
/*==============================================================*/
create table STOCK_SITE (
   ID_STOCK_SITE        ID                   not null,
   ID_ARTICLE           ID                   not null,
   ID_SITE              ID                   not null,
   QUANTITE             NUMERIC(14,3)        not null default 0,
   constraint PK_STOCK_SITE primary key (ID_STOCK_SITE)
);

create unique index STOCK_SITE_ARTICLE_SITE_UK on STOCK_SITE (ID_ARTICLE, ID_SITE);

alter table STOCK_SITE
   add constraint FK_STOCK_SITE_ARTICLE foreign key (ID_ARTICLE)
      references ARTICLE (ID_ARTICLE);

alter table STOCK_SITE
   add constraint FK_STOCK_SITE_SITE foreign key (ID_SITE)
      references SITE (ID_SITE);

/*==============================================================*/
/* Table : MOUVEMENT_STOCK (historique des entrées / sorties)   */
/*==============================================================*/
create table MOUVEMENT_STOCK (
   ID_MOUVEMENT         ID                   not null,
   ID_ARTICLE           ID                   not null,
   ID_SITE              ID                   not null,
   ID_UTIL              ID                   null,
   TYPE_MOUVEMENT       VARCHAR(10)          not null,
   QUANTITE             NUMERIC(14,3)        not null,
   QUANTITE_AVANT       NUMERIC(14,3)        null,
   QUANTITE_APRES       NUMERIC(14,3)        null,
   MOTIF                VARCHAR(255)         null,
   REFERENCE_DOC        VARCHAR(100)         null,
   DATE_MOUVEMENT       TIMESTAMP            not null default CURRENT_TIMESTAMP,
   constraint PK_MOUVEMENT_STOCK primary key (ID_MOUVEMENT),
   constraint CK_MOUVEMENT_TYPE check (TYPE_MOUVEMENT in ('ENTREE', 'SORTIE', 'AJUSTEMENT'))
);

create index MOUVEMENT_STOCK_ARTICLE_IDX on MOUVEMENT_STOCK (ID_ARTICLE);
create index MOUVEMENT_STOCK_SITE_IDX on MOUVEMENT_STOCK (ID_SITE);
create index MOUVEMENT_STOCK_DATE_IDX on MOUVEMENT_STOCK (DATE_MOUVEMENT);

alter table MOUVEMENT_STOCK
   add constraint FK_MOUVEMENT_ARTICLE foreign key (ID_ARTICLE)
      references ARTICLE (ID_ARTICLE);

alter table MOUVEMENT_STOCK
   add constraint FK_MOUVEMENT_SITE foreign key (ID_SITE)
      references SITE (ID_SITE);

alter table MOUVEMENT_STOCK
   add constraint FK_MOUVEMENT_UTILISATEUR foreign key (ID_UTIL)
      references UTILISATEUR (ID_UTIL);

/*==============================================================*/
/* Table : INVENTAIRE (campagne de comptage physique par site)  */
/*==============================================================*/
create table INVENTAIRE (
   ID_INVENTAIRE        ID                   not null,
   COD_INVENTAIRE       CODE                 null,
   ID_SITE              ID                   not null,
   ID_UTIL              ID                   null,
   STATUT               VARCHAR(15)          not null default 'EN_COURS',
   DATE_INVENTAIRE      TIMESTAMP            not null default CURRENT_TIMESTAMP,
   DATE_CLOTURE         TIMESTAMP            null,
   constraint PK_INVENTAIRE primary key (ID_INVENTAIRE),
   constraint CK_INVENTAIRE_STATUT check (STATUT in ('EN_COURS', 'CLOTURE'))
);

alter table INVENTAIRE
   add constraint FK_INVENTAIRE_SITE foreign key (ID_SITE)
      references SITE (ID_SITE);

alter table INVENTAIRE
   add constraint FK_INVENTAIRE_UTILISATEUR foreign key (ID_UTIL)
      references UTILISATEUR (ID_UTIL);

/*==============================================================*/
/* Table : INVENTAIRE_LIGNE (comptage par article)               */
/*==============================================================*/
create table INVENTAIRE_LIGNE (
   ID_LIGNE             ID                   not null,
   ID_INVENTAIRE        ID                   not null,
   ID_ARTICLE           ID                   not null,
   QUANTITE_THEORIQUE   NUMERIC(14,3)        not null default 0,
   QUANTITE_PHYSIQUE    NUMERIC(14,3)        null,
   ECART                NUMERIC(14,3)        null,
   constraint PK_INVENTAIRE_LIGNE primary key (ID_LIGNE)
);

create unique index INVENTAIRE_LIGNE_UK on INVENTAIRE_LIGNE (ID_INVENTAIRE, ID_ARTICLE);

alter table INVENTAIRE_LIGNE
   add constraint FK_INV_LIGNE_INVENTAIRE foreign key (ID_INVENTAIRE)
      references INVENTAIRE (ID_INVENTAIRE);

alter table INVENTAIRE_LIGNE
   add constraint FK_INV_LIGNE_ARTICLE foreign key (ID_ARTICLE)
      references ARTICLE (ID_ARTICLE);
