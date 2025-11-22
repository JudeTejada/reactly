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
      <Card className="border-red-200 bg-red-50/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Analysis Failed
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              Failed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-red-600/80">
              {jobStatus.error || "Job failed or was cancelled"}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onRefresh}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  className="flex items-center gap-2 bg-background"
                >
                  <X className="h-3.5 w-3.5" />
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
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              Generating Insights...
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-background">
              Processing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
               <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Analyzing feedback patterns...</span>
                  <span>{jobStatus.progress || 0}%</span>
               </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${jobStatus.progress || 0}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
               This process usually takes about 10-20 seconds depending on your data volume.
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
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            AI Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
            Generated{" "}
            {formatDistanceToNow(new Date(data.generatedAt), {
              addSuffix: true,
            })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold tracking-tight text-foreground">Executive Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>

        {/* Key Themes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold tracking-tight text-foreground">Key Themes</h4>
          <div className="flex flex-wrap gap-2">
            {data.keyThemes.map((theme, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs font-medium bg-muted/50 hover:bg-muted">
                {theme}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
             {/* Recommendations */}
            {data?.recommendations && (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Recommendations
                </h4>
                <ul className="space-y-3">
                {data.recommendations.map((rec, idx) => (
                    <li
                    key={idx}
                    className="text-sm text-muted-foreground flex items-start gap-3 bg-muted/20 p-3 rounded-lg"
                    >
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                    </li>
                ))}
                </ul>
            </div>
            )}

             {/* Statistics */}
            <div className="space-y-3">
                 <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Snapshot
                 </h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                        Total Feedback
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                        {data.statistics.totalFeedback}
                    </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Avg. Rating</div>
                    <div className="text-2xl font-bold tracking-tight">
                        {data.statistics.averageRating.toFixed(1)}
                    </div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">Positive</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        {data.statistics.positivePercentage}%
                    </div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <div className="text-xs text-rose-700 uppercase tracking-wider font-medium mb-1">Negative</div>
                    <div className="text-2xl font-bold text-rose-600">
                        {data.statistics.negativePercentage}%
                    </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Insights */}
        {data?.insights && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold tracking-tight text-foreground">Detailed Findings</h4>
            <div className="grid gap-3">
              {data.insights.map((insight, idx) => {
                const Icon = iconMap[insight.type];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group p-4 border border-border/50 rounded-lg bg-card hover:shadow-sm hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-md bg-muted/50 group-hover:bg-primary/5 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-foreground">
                            {insight.title}
                          </h5>
                          <Badge
                            variant={priorityVariantMap[insight.priority]}
                            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5"
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
      </CardContent>
    </Card>
  );
}