/**
 * The FONCTIONNALITE table's LIB_FONCTIONNALITE column is seeded once in the
 * database (see backend Flyway migrations) and may contain French or mixed
 * labels. Rather than touching the backend/DB seed data, we translate known
 * codes to English purely for display, and fall back to the raw DB label for
 * any code we don't recognize (e.g. custom features added later).
 */
const FONCTIONNALITE_LABELS_EN: Record<string, string> = {
  ADMINISTRATION: "Administration",
  ADMIN_UTILISATEURS: "Users",
  ADMIN_SITES: "Sites",
  ADMIN_PROFILS: "Profiles",
  ADMIN_ROLES: "Roles",
  ADMIN_GROUPES: "Groups",
  ADMIN_FONCTIONNALITES: "Features",
  ADMIN_AUDIT: "Access Audit",
  ARTICLES: "Articles",
  CATEGORIES: "Categories",
  FOURNISSEURS: "Suppliers",
  ENTREES_STOCK: "Stock In",
  SORTIES_STOCK: "Stock Out",
  INVENTAIRE: "Inventory",
  RAPPORTS: "Reports",
};

/** Translates a feature's display label for English UI, based on its code. */
export function translateFoncLabel(codeFonc: string | undefined | null, fallback: string): string {
  if (!codeFonc) return fallback;
  return FONCTIONNALITE_LABELS_EN[codeFonc] ?? fallback;
}
