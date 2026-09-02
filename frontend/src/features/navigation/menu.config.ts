import type { ElementType } from "react";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiShield,
  FiKey,
  FiLayers,
  FiSliders,
  FiBox,
  FiTag,
  FiTruck,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiClipboard,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { ROUTES } from "@/lib/constants";

export interface MenuItem {
  label: string;
  href?: string;
  icon: ElementType;
  /** Code de la fonctionnalité côté backend, utilisé pour le filtrage des droits. Null = toujours visible (ex: Dashboard). */
  code: string | null;
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: FiHome, code: null },
  {
    label: "Administration",
    icon: FiSliders,
    code: "ADMINISTRATION",
    children: [
      { label: "Users", href: ROUTES.administration.utilisateurs, icon: FiUsers, code: "ADMIN_UTILISATEURS" },
      { label: "Sites", href: ROUTES.administration.sites, icon: FiMapPin, code: "ADMIN_SITES" },
      { label: "Profiles", href: ROUTES.administration.profils, icon: FiShield, code: "ADMIN_PROFILS" },
      { label: "Roles", href: ROUTES.administration.roles, icon: FiKey, code: "ADMIN_ROLES" },
      { label: "Groups", href: ROUTES.administration.groupes, icon: FiLayers, code: "ADMIN_GROUPES" },
      { label: "Features", href: ROUTES.administration.fonctionnalites, icon: FiSliders, code: "ADMIN_FONCTIONNALITES" },
      { label: "Access Audit", href: ROUTES.administration.audit, icon: FiFileText, code: "ADMIN_AUDIT" },
    ],
  },
  { label: "Articles", href: "/articles", icon: FiBox, code: "ARTICLES" },
  { label: "Categories", href: "/categories", icon: FiTag, code: "CATEGORIES" },
  { label: "Suppliers", href: "/fournisseurs", icon: FiTruck, code: "FOURNISSEURS" },
  { label: "Stock In", href: "/entrees-stock", icon: FiArrowDownCircle, code: "ENTREES_STOCK" },
  { label: "Stock Out", href: "/sorties-stock", icon: FiArrowUpCircle, code: "SORTIES_STOCK" },
  { label: "Inventory", href: "/inventaire", icon: FiClipboard, code: "INVENTAIRE" },
  { label: "Reports", href: "/rapports", icon: FiBarChart2, code: "RAPPORTS" },
];
