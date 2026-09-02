"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiTrash2, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { toast } from "@/store/toast.store";
import { userSiteDroitService } from "../services/user-site-droit.service";
import { profilService } from "@/features/administration/profils/services/profil.service";
import { roleService } from "@/features/administration/roles/services/role.service";
import { groupeService } from "@/features/administration/groupes/services/groupe.service";
import type { Utilisateur } from "../types/user.types";

interface Props {
  user: Utilisateur;
}

type AffectationType = "profil" | "groupe" | "role";

export function UserSiteDroitsTab({ user }: Props) {
  const queryClient = useQueryClient();
  const [idUtilSite, setIdUtilSite] = useState(user.sites[0]?.idUtilSite ?? "");
  const [type, setType] = useState<AffectationType>("profil");
  const [entityId, setEntityId] = useState("");

  const { data: profils } = useQuery({ queryKey: ["profils", "all"], queryFn: profilService.listAll });
  const { data: roles } = useQuery({ queryKey: ["roles", "all"], queryFn: roleService.listAll });
  const { data: groupes = [] } = useQuery({ queryKey: ["groupes", "all"], queryFn: groupeService.listAll });

  const droitsQuery = useQuery({
    queryKey: ["user-site-droits", user.idUtil],
    queryFn: () =>
      Promise.all(
        user.sites.map(async (site) => ({
          site,
          droits: await userSiteDroitService.listByUserSite(site.idUtilSite),
        }))
      ),
    enabled: user.sites.length > 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["user-site-droits", user.idUtil] });

  const createMutation = useMutation({
    mutationFn: userSiteDroitService.create,
    onSuccess: () => {
      toast({ title: "Assignment saved", description: "The permission has been assigned to the site.", variant: "success" });
      setEntityId("");
      invalidate();
    },
    onError: () => toast({ title: "Error", description: "Unable to assign this permission.", variant: "error" }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => userSiteDroitService.remove(id),
    onSuccess: () => {
      toast({ title: "Assignment removed", variant: "success" });
      invalidate();
    },
    onError: () => toast({ title: "Error", description: "Unable to remove this assignment.", variant: "error" }),
  });

  function handleAffecter() {
    if (!idUtilSite || !entityId) return;
    createMutation.mutate({
      idUtilSite,
      idPr: type === "profil" ? entityId : undefined,
      idGr: type === "groupe" ? entityId : undefined,
      idRl: type === "role" ? entityId : undefined,
    });
  }

  function labelFor(kind: AffectationType, id?: string | null): string {
    if (!id) return id ?? "";
    if (kind === "profil") return profils?.find((p) => p.idPr === id)?.libelle ?? id;
    if (kind === "groupe") return groupes.find((g) => g.idGr === id)?.libelle ?? id;
    return roles?.find((r) => r.idRl === id)?.libelle ?? id;
  }

  const entityOptions =
    type === "profil"
      ? (profils ?? []).map((p) => ({ value: p.idPr, label: p.libelle }))
      : type === "groupe"
      ? groupes.map((g) => ({ value: g.idGr, label: g.libelle }))
      : (roles ?? []).map((r) => ({ value: r.idRl, label: r.libelle }));

  if (user.sites.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        Assign one or more sites to this user first (Information tab) before
        granting a profile, group, or role.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-4">
        <Select
          label="Site"
          value={idUtilSite}
          onChange={(e) => setIdUtilSite(e.target.value)}
          options={user.sites.map((s) => ({ value: s.idUtilSite, label: s.nomSite }))}
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as AffectationType);
            setEntityId("");
          }}
          options={[
            { value: "profil", label: "Profile" },
            { value: "groupe", label: "Group" },
            { value: "role", label: "Role" },
          ]}
        />
        <Select
          label={type === "profil" ? "Profile" : type === "groupe" ? "Group" : "Role"}
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Select..."
          options={entityOptions}
        />
        <div className="flex items-end">
          <Button
            leftIcon={<FiPlus size={16} />}
            className="w-full"
            isLoading={createMutation.isPending}
            disabled={!idUtilSite || !entityId}
            onClick={handleAffecter}
          >
            Assign
          </Button>
        </div>
      </div>

      {droitsQuery.isLoading ? (
        <Loader label="Loading assignments..." />
      ) : (
        <div className="flex flex-col gap-4">
          {(droitsQuery.data ?? []).map(({ site, droits }) => (
            <div key={site.idUtilSite} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <FiShield size={14} className="text-brand-600" />
                {site.nomSite}
              </p>
              {droits.length === 0 ? (
                <p className="text-xs text-slate-400">No profile, group, or role assigned to this site.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {droits.map((d) => {
                    const kind: AffectationType = d.idPr ? "profil" : d.idGr ? "groupe" : "role";
                    return (
                      <li
                        key={d.idUserSiteDroit}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"
                      >
                        <span className="flex items-center gap-2">
                          <Badge variant={kind === "profil" ? "brand" : kind === "groupe" ? "warning" : "neutral"}>
                            {kind === "profil" ? "Profile" : kind === "groupe" ? "Group" : "Role"}
                          </Badge>
                          {labelFor(kind, d.idPr ?? d.idGr ?? d.idRl)}
                        </span>
                        <button
                          onClick={() => removeMutation.mutate(d.idUserSiteDroit)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          aria-label="Remove this assignment"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
