"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { fournisseurSchema, type FournisseurFormValues } from "../validation/fournisseur.validation";
import type { Fournisseur } from "../types/fournisseur.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FournisseurFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Fournisseur | null;
}

const EMPTY: FournisseurFormValues = {
  codeFournisseur: "", nomFournisseur: "", contact: "", telephone: "", email: "", adresse: "",
};

export function FournisseurFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FournisseurFormValues>({
    resolver: zodResolver(fournisseurSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              codeFournisseur: initialData.codeFournisseur,
              nomFournisseur: initialData.nomFournisseur,
              contact: initialData.contact ?? "",
              telephone: initialData.telephone ?? "",
              email: initialData.email ?? "",
              adresse: initialData.adresse ?? "",
            }
          : EMPTY
      );
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit supplier" : "New supplier"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Save" : "Create"}</Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code" placeholder="SUP-001" error={errors.codeFournisseur?.message} {...register("codeFournisseur")} />
        <Input label="Name" placeholder="Delta Corp" error={errors.nomFournisseur?.message} {...register("nomFournisseur")} />
        <Input label="Contact" error={errors.contact?.message} {...register("contact")} />
        <Input label="Phone" error={errors.telephone?.message} {...register("telephone")} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Address" className="sm:col-span-2" error={errors.adresse?.message} {...register("adresse")} />
      </form>
    </Modal>
  );
}
