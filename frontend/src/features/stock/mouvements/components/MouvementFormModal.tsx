"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { mouvementSchema, type MouvementFormValues } from "../validation/mouvement.validation";
import { articleService } from "@/features/stock/articles/services/article.service";
import { siteService } from "@/features/administration/sites/services/site.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MouvementFormValues) => void;
  isSubmitting?: boolean;
  type: "entrees" | "sorties";
}

const EMPTY: MouvementFormValues = { idArticle: "", idSite: "", quantite: 0, motif: "", referenceDoc: "" };

export function MouvementFormModal({ isOpen, onClose, onSubmit, isSubmitting, type }: Props) {
  const isEntree = type === "entrees";

  const { data: articles } = useQuery({ queryKey: ["articles", "all"], queryFn: articleService.listAll, enabled: isOpen });
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll, enabled: isOpen });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MouvementFormValues>({
    resolver: zodResolver(mouvementSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (isOpen) reset(EMPTY);
  }, [isOpen, reset]);

  const articleOptions = (articles ?? []).map((a) => ({ value: a.idArticle, label: `${a.codeArticle} — ${a.nomArticle}` }));
  const siteOptions = (sites ?? []).map((s) => ({ value: s.idSite, label: s.nomSite }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEntree ? "New stock in" : "New stock out"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {isEntree ? "Save stock in" : "Save stock out"}
          </Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="idArticle"
          render={({ field }) => (
            <Select
              label="Article"
              placeholder="Select an article"
              options={articleOptions}
              error={errors.idArticle?.message}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="idSite"
          render={({ field }) => (
            <Select
              label="Site"
              placeholder="Select a site"
              options={siteOptions}
              error={errors.idSite?.message}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Input label="Quantity" type="number" step="0.01" error={errors.quantite?.message} {...register("quantite")} />
        <Input label="Document reference" placeholder="DN-2026-001" error={errors.referenceDoc?.message} {...register("referenceDoc")} />
        <Input label="Reason" className="sm:col-span-2" placeholder={isEntree ? "Supplier delivery..." : "Sale, breakage, transfer..."} error={errors.motif?.message} {...register("motif")} />
      </form>
    </Modal>
  );
}
