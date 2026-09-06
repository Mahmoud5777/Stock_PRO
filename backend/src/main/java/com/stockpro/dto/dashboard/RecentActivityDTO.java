package com.stockpro.dto.dashboard;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityDTO {
    private String id;
    private String libelle;
    private String utilisateur;
    private LocalDateTime date;
    /** "creation" | "modification" | "suppression" | "connexion" (voir dashboard.types.ts côté frontend). */
    private String type;
}
