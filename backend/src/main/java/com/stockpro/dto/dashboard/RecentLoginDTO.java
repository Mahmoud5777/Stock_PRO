package com.stockpro.dto.dashboard;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentLoginDTO {
    private String idUtil;
    private String nomComplet;
    private String login;
    private LocalDateTime dateConnexion;
    private String adresseIp;
    /** "succes" | "echec" (voir dashboard.types.ts côté frontend). */
    private String statut;
}
