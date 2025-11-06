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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
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
}

export const api = new ApiClient(API_URL);
