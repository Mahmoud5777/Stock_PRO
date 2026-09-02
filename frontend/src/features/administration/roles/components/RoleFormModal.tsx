"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { roleSchema, type RoleFormValues } from "../validation/role.validation";
import type { Role } from "../types/role.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Role | null;
}

export function RoleFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema) });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ? { codeRole: initialData.codeRole, libelle: initialData.libelle, description: initialData.description ?? "" } : { codeRole: "", libelle: "", description: "" });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit role" : "New role"}
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Save" : "Create"}</Button>
      </>}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Role code" error={errors.codeRole?.message} {...register("codeRole")} />
        <Input label="Name" error={errors.libelle?.message} {...register("libelle")} />
        <Input label="Description" error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}
