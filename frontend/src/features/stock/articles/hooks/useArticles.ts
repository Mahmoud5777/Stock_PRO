"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { articleService } from "../services/article.service";

export function useArticles() {
  return useEntityCrud(articleService, { resourceKey: "articles", entityLabel: "the article" });
}
