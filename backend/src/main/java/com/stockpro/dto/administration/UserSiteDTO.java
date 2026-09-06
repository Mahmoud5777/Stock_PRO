package com.stockpro.dto.administration;

import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import com.stockpro.mapper.administration.UserSiteMapper;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDTO {


    private UUID idUtilSite;

    @NotNull(message = "L'idUtil est obligatoire")
    private UUID idUtil;

    @NotNull(message = "L'idSite est obligatoire")
    private UUID idSite;

    private LocalDate dateAffectation;


}
