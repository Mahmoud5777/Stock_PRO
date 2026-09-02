import { apiClient } from "@/lib/axios";
import type { RapportSynthese } from "../types/rapport.types";

export const rapportService = {
  async synthese(): Promise<RapportSynthese> {
    const { data } = await apiClient.get<RapportSynthese>("/rapports/synthese");
    return data;
  },
};
