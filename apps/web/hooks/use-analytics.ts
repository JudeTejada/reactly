import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AnalyticsFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  limit?: number;
}

export function useAnalyticsOverview(filters: Omit<AnalyticsFilters, "days" | "limit"> = {}) {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => api.getAnalyticsOverview(filters),
  });
}

export function useAnalyticsTrends(filters: Omit<AnalyticsFilters, "limit"> = {}) {
  return useQuery({
    queryKey: ["analytics", "trends", filters],
    queryFn: () => api.getAnalyticsTrends(filters),
  });
}

export function useRecentFeedback(filters: Pick<AnalyticsFilters, "projectId" | "limit"> = {}) {
  return useQuery({
    queryKey: ["analytics", "recent", filters],
    queryFn: () => api.getRecentFeedback(filters),
  });
}

export function useInsights(filters: Omit<AnalyticsFilters, "days" | "limit"> = {}) {
  return useQuery({
    queryKey: ["insights", "existing", filters],
    queryFn: () => api.getInsights(filters),
    enabled: false,
  });
}

export function useGenerateInsights(filters: Omit<AnalyticsFilters, "days" | "limit"> = {}) {
  return useQuery({
    queryKey: ["insights", "generate", filters],
    queryFn: () => api.generateInsights(filters),
    enabled: false,
  });
}
