import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AnalyticsFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  limit?: number;
}

export function useAnalyticsOverview(
  filters: Omit<AnalyticsFilters, "days" | "limit"> = {}
) {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => api.getAnalyticsOverview(filters),
  });
}

export function useAnalyticsTrends(
  filters: Omit<AnalyticsFilters, "limit"> = {}
) {
  return useQuery({
    queryKey: ["analytics", "trends", filters],
    queryFn: () => api.getAnalyticsTrends(filters),
  });
}

export function useRecentFeedback(
  filters: Pick<AnalyticsFilters, "projectId" | "limit"> = {}
) {
  return useQuery({
    queryKey: ["analytics", "recent", filters],
    queryFn: () => api.getRecentFeedback(filters),
  });
}

export function useInsights(
  filters: Omit<AnalyticsFilters, "days" | "limit"> = {}
) {
  return useQuery({
    queryKey: ["insights", "existing", filters],
    queryFn: () => api.getInsights(filters),
    enabled: false,
  });
}

// Job management utilities
const JOB_STORAGE_KEY = "reactly-insights-job";
const JOB_POLLING_INTERVAL = 2000; // 2 seconds

function getStoredJob(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JOB_STORAGE_KEY);
}

function setStoredJob(jobId: string | null): void {
  if (typeof window === "undefined") return;
  if (jobId) {
    localStorage.setItem(JOB_STORAGE_KEY, jobId);
  } else {
    localStorage.removeItem(JOB_STORAGE_KEY);
  }
}

export function useGenerateInsights(
  filters: Omit<AnalyticsFilters, "days" | "limit"> = {}
) {
  const [currentJobId, setCurrentJobId] = useState<string | null>(
    getStoredJob()
  );
  const [isPolling, setIsPolling] = useState(false);

  // Start polling when we have a job ID
  useEffect(() => {
    if (!currentJobId || isPolling) return;

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const status = await api.getInsightsJobStatus(currentJobId);

        if (
          status.status === "completed" ||
          status.status === "failed" ||
          status.status === "cancelled"
        ) {
          // Job finished, clear stored job
          setCurrentJobId(null);
          setStoredJob(null);
        }
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    }, JOB_POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [currentJobId]);

  // Check if there's an existing job when component mounts
  useEffect(() => {
    const storedJobId = getStoredJob();
    if (storedJobId && !currentJobId) {
      setCurrentJobId(storedJobId);
    }
  }, []);

  const createJob = useMutation({
    mutationFn: () => api.createInsightsJob(filters),
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setStoredJob(data.jobId);
    },
  });

  const cancelJob = useMutation({
    mutationFn: () =>
      currentJobId ? api.cancelInsightsJob(currentJobId) : Promise.resolve(),
    onSuccess: () => {
      setCurrentJobId(null);
      setStoredJob(null);
    },
  });

  const jobStatus = useQuery({
    queryKey: ["insights", "job-status", currentJobId],
    queryFn: () =>
      currentJobId ? api.getInsightsJobStatus(currentJobId) : null,
    enabled: !!currentJobId,
    refetchInterval: isPolling ? JOB_POLLING_INTERVAL : false,
    retry: 3,
  });

  // Check job completion and fetch results
  const jobResult = useQuery({
    queryKey: ["insights", "job-result", currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      const status = await api.getInsightsJobStatus(currentJobId);
      if (status.status === "completed" && status.result) {
        return status.result;
      }
      return null;
    },
    enabled: !!currentJobId && jobStatus.data?.status === "completed",
    refetchInterval: isPolling ? JOB_POLLING_INTERVAL : false,
  });

  const isProcessing = !!(
    currentJobId &&
    jobStatus.data &&
    ["pending", "processing"].includes(jobStatus.data.status)
  );
  const hasActiveJob = !!(
    currentJobId &&
    (jobStatus.data?.status === "pending" ||
      jobStatus.data?.status === "processing")
  );

  return {
    // Job management
    createJob: createJob.mutate,
    cancelJob: cancelJob.mutate,
    isCreating: createJob.isPending,
    isCancelling: cancelJob.isPending,

    // Job status
    jobId: currentJobId,
    jobStatus: jobStatus.data || undefined,
    jobResult: jobResult.data || undefined,
    hasActiveJob,
    isProcessing,

    // Legacy support for existing code
    data: jobResult.data || null,
    isLoading: createJob.isPending || isProcessing,
    refetch: () => {
      if (!hasActiveJob) {
        createJob.mutate();
      }
    },
  };
}
