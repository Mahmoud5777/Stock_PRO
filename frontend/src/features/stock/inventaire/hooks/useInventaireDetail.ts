"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventaireService } from "../services/inventaire.service";
import { toast } from "@/store/toast.store";

export function useInventaireDetail(id: string) {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ["inventaires", "detail", id],
    queryFn: () => inventaireService.findById(id),
    enabled: !!id,
  });

  const saisirLigneMutation = useMutation({
    mutationFn: ({ idLigne, quantitePhysique }: { idLigne: string; quantitePhysique: number }) =>
      inventaireService.saisirLigne(id, idLigne, quantitePhysique),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventaires", "detail", id] }),
    onError: () => toast({ title: "Error", description: "Unable to save the counted quantity.", variant: "error" }),
  });

  const cloturerMutation = useMutation({
    mutationFn: () => inventaireService.cloturer(id),
    onSuccess: () => {
      toast({ title: "Inventory closed", description: "Discrepancies have been applied to stock.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["inventaires", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["inventaires", "list"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: () => toast({ title: "Error", description: "Unable to close the inventory.", variant: "error" }),
  });

  return { detailQuery, saisirLigneMutation, cloturerMutation };
}
