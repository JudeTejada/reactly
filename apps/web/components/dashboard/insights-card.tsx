"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface InsightItem {
  type: "theme" | "recommendation" | "alert" | "trend";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface InsightsData {
  summary: string;
  keyThemes: string[];
  recommendations: string[];
  insights: InsightItem[];
  statistics: {
    totalFeedback: number;
    averageRating: number;
    positivePercentage: number;
    negativePercentage: number;
  };
  generatedAt: string;
}

interface InsightsCardProps {
  data?: InsightsData;
  isLoading: boolean;
  onRefresh: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  jobStatus?: {
    status:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "cancelled"
      | "not_found";
    progress?: number;
    result?: any;
    error?: string;
    cached?: boolean;
  };
}

const iconMap = {
  theme: Lightbulb,
  recommendation: Target,
  alert: AlertTriangle,
  trend: TrendingUp,
};

const priorityColorMap = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const priorityVariantMap: Record<
  string,
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export function InsightsCard({
  data,
  isLoading,
  onRefresh,
  onCancel,
  isCancelling,
  jobStatus,
}: InsightsCardProps) {
  // Handle failed jobs with cancel button
  if (jobStatus?.status === "failed" || jobStatus?.status === "cancelled") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              AI Insights
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              Failed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {jobStatus.error || "Job failed or was cancelled"}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onRefresh}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? "Cancelling..." : "Clear"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && jobStatus?.status === "processing") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Insights
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Processing...
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 bg-muted rounded-full flex-1">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${jobStatus.progress || 0}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {jobStatus.progress || 0}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI is analyzing your feedback and generating insights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Generated{" "}
            {formatDistanceToNow(new Date(data.generatedAt), {
              addSuffix: true,
            })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">{data.summary}</p>
        </div>

        {/* Key Themes */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Key Themes</h4>
          <div className="flex flex-wrap gap-2">
            {data.keyThemes.map((theme, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {data?.recommendations && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-green-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insights */}
        {data?.insights && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Detailed Insights</h4>
            <div className="space-y-3">
              {data.insights.map((insight, idx) => {
                const Icon = iconMap[insight.type];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">
                            {insight.title}
                          </h5>
                          <Badge
                            variant={priorityVariantMap[insight.priority]}
                            className="text-xs"
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">
                Total Feedback
              </div>
              <div className="text-2xl font-bold">
                {data.statistics.totalFeedback}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg. Rating</div>
              <div className="text-2xl font-bold">
                {data.statistics.averageRating.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Positive</div>
              <div className="text-2xl font-bold text-green-600">
                {data.statistics.positivePercentage}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Negative</div>
              <div className="text-2xl font-bold text-red-600">
                {data.statistics.negativePercentage}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
