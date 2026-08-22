import { apiRequest } from "@/lib/api/client";
import type { RoomType } from "@/lib/api/pg";

export interface MonthlyPoint {
  /** YYYY-MM, kept as a plain month so no timezone can shift it. */
  month: string;
  occupiedBeds: number;
  occupancyRate: number;
  collected: number;
  joined: number;
  left: number;
  visits: number;
}

export interface RoomTypePerformance {
  type: RoomType;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  monthlyRevenue: number;
}

export interface AnalyticsSummary {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  activeGuests: number;
  pastGuests: number;
  /** Null until at least one guest has moved out. */
  averageStayMonths: number | null;
  visitsTotal: number;
  visitsCompleted: number;
  visitConversion: number;
  monthly: MonthlyPoint[];
  byRoomType: RoomTypePerformance[];
  occupancyCaveat: string;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const response = await apiRequest<{ data: AnalyticsSummary }>(
    "/v1/pg/me/analytics"
  );

  return response.data;
}
