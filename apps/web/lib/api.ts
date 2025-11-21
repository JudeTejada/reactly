import { API_URL } from "./constants";
import type {
  Project,
  CreateProjectDto,
  Feedback,
  PaginatedResponse,
  FeedbackStats,
  SentimentType,
  FeedbackCategory,
} from "@reactly/shared";

// Token provider - set by the app
let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenProvider ? await tokenProvider() : null;
    
    console.log('[API] Request:', {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error('[API] Error:', error);
      throw new Error(error.message || error.error || "API request failed");
    }

    const data = await response.json();
    console.log('[API] Response:', { endpoint, success: data.success });
    
    // Unwrap the backend response format { success: true, data: ... }
    return data.data !== undefined ? data.data : data;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.fetch("/projects");
  }

  async getProject(id: string): Promise<Project> {
    return this.fetch(`/projects/${id}`);
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    return this.fetch("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    return this.fetch(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.fetch(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  async regenerateApiKey(id: string): Promise<Project> {
    return this.fetch(`/projects/${id}/regenerate-key`, {
      method: "POST",
    });
  }

  async toggleProjectActive(id: string): Promise<Project> {
    return this.fetch(`/projects/${id}/toggle-active`, {
      method: "POST",
    });
  }

  // Feedback
  async getFeedback(params: {
    projectId?: string;
    sentiment?: SentimentType;
    category?: FeedbackCategory;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Feedback>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/feedback${query ? `?${query}` : ""}`);
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    return this.fetch(`/feedback/${id}`);
  }

  async deleteFeedback(id: string): Promise<void> {
    return this.fetch(`/feedback/${id}`, {
      method: "DELETE",
    });
  }

  // Analytics
  async getAnalyticsOverview(params: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<FeedbackStats> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/analytics/overview${query ? `?${query}` : ""}`);
  }

  async getAnalyticsTrends(params: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
    days?: number;
  }): Promise<Array<{ date: string; positive: number; negative: number; neutral: number }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/analytics/trends${query ? `?${query}` : ""}`);
  }

  async getRecentFeedback(params: {
    projectId?: string;
    limit?: number;
  }): Promise<Feedback[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/analytics/recent${query ? `?${query}` : ""}`);
  }

  // Insights
  async getInsights(params: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    summary: string;
    keyThemes: string[];
    recommendations: string[];
    insights: Array<{
      type: 'theme' | 'recommendation' | 'alert' | 'trend';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      supportingData?: any;
    }>;
    statistics: {
      totalFeedback: number;
      averageRating: number;
      positivePercentage: number;
      negativePercentage: number;
    };
    generatedAt: string;
  } | null> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/insights${query ? `?${query}` : ""}`);
  }

  async generateInsights(params: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    summary: string;
    keyThemes: string[];
    recommendations: string[];
    insights: Array<{
      type: 'theme' | 'recommendation' | 'alert' | 'trend';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      supportingData?: any;
    }>;
    statistics: {
      totalFeedback: number;
      averageRating: number;
      positivePercentage: number;
      negativePercentage: number;
    };
    generatedAt: string;
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.fetch(`/insights/generate${query ? `?${query}` : ""}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_URL);
