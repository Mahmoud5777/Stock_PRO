// Based on the SITE table (fields aligned with SiteDTO.java, hierarchy via idSiteParent)
export interface Site {
  idSite: string;
  codeSite: string;
  nomSite: string;
  description?: string;
  address?: string;
  idSiteParent?: string | null;
  /** Parent site label, resolved on the frontend (not present in SiteDTO). */
  parentNomSite?: string | null;
}

export interface SiteInput {
  codeSite: string;
  nomSite: string;
  description?: string;
  address?: string;
  idSiteParent?: string | null;
}
