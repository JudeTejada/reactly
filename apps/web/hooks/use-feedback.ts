import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SentimentType, FeedbackCategory } from "@reactly/shared";

interface FeedbackFilters {
  projectId?: string;
  sentiment?: SentimentType;
  category?: FeedbackCategory;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export function useFeedback(filters: FeedbackFilters = {}) {
  return useQuery({
    queryKey: ["feedback", filters],
    queryFn: () => api.getFeedback(filters),
  });
}

export function useFeedbackById(id: string) {
  return useQuery({
    queryKey: ["feedback", id],
    queryFn: () => api.getFeedbackById(id),
    enabled: !!id,
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
