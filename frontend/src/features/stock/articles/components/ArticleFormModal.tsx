"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { articleSchema, type ArticleFormValues } from "../validation/article.validation";
import type { Article } from "../types/article.types";
import { categorieService } from "@/features/stock/categories/services/categorie.service";
import { fournisseurService } from "@/features/stock/fournisseurs/services/fournisseur.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ArticleFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Article | null;
}

const EMPTY: ArticleFormValues = {
  codeArticle: "", nomArticle: "", description: "", unite: "unit",
  prixAchat: 0, prixVente: 0, seuilAlerte: 0, actif: true,
  idCategorie: "", idFournisseur: "",
};

export function ArticleFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;

  const { data: categories } = useQuery({ queryKey: ["categories", "all"], queryFn: categorieService.listAll, enabled: isOpen });
  const { data: fournisseurs } = useQuery({ queryKey: ["fournisseurs", "all"], queryFn: fournisseurService.listAll, enabled: isOpen });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              codeArticle: initialData.codeArticle,
              nomArticle: initialData.nomArticle,
              description: initialData.description ?? "",
              unite: initialData.unite ?? "unit",
              prixAchat: initialData.prixAchat,
              prixVente: initialData.prixVente,
              seuilAlerte: initialData.seuilAlerte,
              actif: initialData.actif,
              idCategorie: initialData.idCategorie ?? "",
              idFournisseur: initialData.idFournisseur ?? "",
            }
          : EMPTY
      );
    }
  }, [isOpen, initialData, reset]);

  const categorieOptions = (categories ?? []).map((c) => ({ value: c.idCategorie, label: c.nomCategorie }));
  const fournisseurOptions = (fournisseurs ?? []).map((f) => ({ value: f.idFournisseur, label: f.nomFournisseur }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit article" : "New article"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Save" : "Create"}</Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code" placeholder="ART-001" error={errors.codeArticle?.message} {...register("codeArticle")} />
        <Input label="Name" placeholder="Arabica Coffee 1kg" error={errors.nomArticle?.message} {...register("nomArticle")} />

        <Controller
          control={control}
          name="idCategorie"
          render={({ field }) => (
            <Select label="Category" placeholder="None" options={categorieOptions} value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="idFournisseur"
          render={({ field }) => (
            <Select label="Supplier" placeholder="None" options={fournisseurOptions} value={field.value ?? ""} onChange={field.onChange} />
          )}
        />

        <Input label="Unit" placeholder="unit, kg, liter..." error={errors.unite?.message} {...register("unite")} />
        <Input label="Alert threshold" type="number" step="0.01" error={errors.seuilAlerte?.message} {...register("seuilAlerte")} />
        <Input label="Purchase price" type="number" step="0.01" error={errors.prixAchat?.message} {...register("prixAchat")} />
        <Input label="Selling price" type="number" step="0.01" error={errors.prixVente?.message} {...register("prixVente")} />

        <Input label="Description" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />
        <Checkbox label="Active article" {...register("actif")} />
      </form>
    </Modal>
  );
}
