package com.stockpro.service.dashboard;

import com.stockpro.dto.dashboard.DashboardStatsDTO;
import com.stockpro.dto.dashboard.RecentActivityDTO;
import com.stockpro.dto.dashboard.RecentLoginDTO;
import com.stockpro.dto.dashboard.StockMovementPointDTO;

import java.util.List;

public interface DashboardService {
    DashboardStatsDTO getStats();
    List<StockMovementPointDTO> getMouvementsStock();
    List<RecentActivityDTO> getActivitesRecentes();
    List<RecentLoginDTO> getDernieresConnexions();
}
