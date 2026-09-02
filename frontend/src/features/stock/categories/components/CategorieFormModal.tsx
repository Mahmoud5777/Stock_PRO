"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { categorieSchema, type CategorieFormValues } from "../validation/categorie.validation";
import type { Categorie } from "../types/categorie.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CategorieFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Categorie | null;
}

export function CategorieFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategorieFormValues>({
    resolver: zodResolver(categorieSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { codeCategorie: initialData.codeCategorie, nomCategorie: initialData.nomCategorie, description: initialData.description ?? "" }
          : { codeCategorie: "", nomCategorie: "", description: "" }
      );
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit category" : "New category"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Save" : "Create"}</Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code" placeholder="CAT-001" error={errors.codeCategorie?.message} {...register("codeCategorie")} />
        <Input label="Name" placeholder="Beverages" error={errors.nomCategorie?.message} {...register("nomCategorie")} />
        <Input label="Description" error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}
