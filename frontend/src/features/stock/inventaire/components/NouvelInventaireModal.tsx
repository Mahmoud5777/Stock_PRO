"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { siteService } from "@/features/administration/sites/services/site.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (idSite: string) => void;
  isSubmitting?: boolean;
}

export function NouvelInventaireModal({ isOpen, onClose, onConfirm, isSubmitting }: Props) {
  const [idSite, setIdSite] = useState("");
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll, enabled: isOpen });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New inventory"
      description="Lines will be pre-filled with the site's current theoretical stock."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button isLoading={isSubmitting} disabled={!idSite} onClick={() => onConfirm(idSite)}>Open inventory</Button>
        </>
      }
    >
      <Select
        label="Site to inventory"
        placeholder="Select a site"
        options={(sites ?? []).map((s) => ({ value: s.idSite, label: s.nomSite }))}
        value={idSite}
        onChange={(e) => setIdSite(e.target.value)}
      />
    </Modal>
  );
}
