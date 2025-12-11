"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SentimentBadge } from "@/components/dashboard/sentiment-badge";
import { RatingStars } from "@/components/dashboard/rating-stars";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InsightsCard } from "@/components/dashboard/insights-card";
import {
  useAnalyticsOverview,
  useRecentFeedback,
  useAnalyticsTrends,
  useInsights,
  useGenerateInsights,
} from "@/hooks/use-analytics";
import { useProjectStore } from "@/stores/use-project-store";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Inbox,
  Filter,
  Lightbulb,
  Search,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SentimentType, FeedbackCategory } from "@reactly/shared";

export default function DashboardPage() {
  const { selectedProjectId } = useProjectStore();
  const projectId = selectedProjectId || undefined;

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview({ projectId });
  const { data: recentFeedback, isLoading: feedbackLoading } =
    useRecentFeedback({ projectId, limit: 50 });
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends({
    projectId,
    days: 30,
  });
  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useInsights({ projectId });

  const {
    data: generatedInsights,
    isLoading: generateInsightsLoading,
    refetch: refetchGenerateInsights,
    hasActiveJob,
    isProcessing,
    jobStatus,
    createJob,
    cancelJob,
    isCancelling,
  } = useGenerateInsights({ projectId });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<
    SentimentType | "all"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<
    FeedbackCategory | "all"
  >("all");

  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (overview && overview.total > 0) {
      setHasData(true);
      refetchInsights();
    }
  }, [overview, refetchInsights]);

  // --- Loading State ---
  if (overviewLoading || feedbackLoading || trendsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-sm bg-card">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const currentInsights = generatedInsights || insights;

  const filteredFeedback =
    recentFeedback?.filter((feedback) => {
      const matchesSearch =
        searchQuery === "" ||
        feedback.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment =
        selectedSentiment === "all" || feedback.sentiment === selectedSentiment;
      const matchesCategory =
        selectedCategory === "all" || feedback.category === selectedCategory;
      return matchesSearch && matchesSentiment && matchesCategory;
    }) || [];

  const chartData =
    trends?.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      positive: trend.positive,
      negative: trend.negative,
      neutral: trend.neutral,
      total: trend.positive + trend.negative + trend.neutral,
    })) || [];

  // Mini chart data for stat cards
  const feedbackTrendData = chartData.slice(-7);
  const averageRatingData = chartData.slice(-7).map((d) => ({
    date: d.date,
    rating: 3.5 + Math.random() * 1.5, // Simulated rating trend
  }));

  const sentimentTrendData = chartData.slice(-7).map((d) => ({
    date: d.date,
    positive: Math.round((d.positive / d.total) * 100) || 0,
  }));

  const categoryChartData = overview
    ? Object.entries(overview.categoryBreakdown).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase(),
        count,
      }))
    : [];

  const sentimentData = overview
    ? [
        {
          name: "Positive",
          value: overview.sentimentDistribution.positive,
          color: "#10b981", // emerald-500
        },
        {
          name: "Neutral",
          value: overview.sentimentDistribution.neutral,
          color: "#71717a", // zinc-500
        },
        {
          name: "Negative",
          value: overview.sentimentDistribution.negative,
          color: "#f43f5e", // rose-500
        },
      ]
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your project's performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchGenerateInsights()}
            disabled={generateInsightsLoading || hasActiveJob}
            className="gap-2 bg-background"
          >
            {hasActiveJob && jobStatus?.status === "processing" ? (
               <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
               <Lightbulb className="h-4 w-4" />
            )}
            {hasActiveJob
              ? jobStatus?.status === "processing"
                ? "Processing..."
                : "In Queue..."
              : generateInsightsLoading
                ? "Starting..."
                : "Generate Insights"}
          </Button>
        </div>
      </div>

      {!hasData ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed shadow-none bg-muted/30">
            <CardContent className="pt-12 pb-12">
              <EmptyState
                icon={Inbox}
                title="No feedback yet"
                description="Create a project and embed the widget to start collecting feedback."

              />
            </CardContent>
          </Card>
        </motion.div>
      ) : hasData && overview ? (
        <>
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Feedback"
              value={overview.total.toLocaleString()}
              description="All-time feedback"
              icon={MessageSquare}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={feedbackTrendData}>
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
            />
            <StatCard
              title="Average Rating"
              value={overview.averageRating.toFixed(1)}
              description="Out of 5 stars"
              icon={Star}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={averageRatingData}>
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <StatCard
              title="Positive Sentiment"
              value={ overview?.sentimentDistribution.positive ? `${Math.round((overview.sentimentDistribution.positive / overview.total) * 100)}%` : "0%"}
              description="Based on AI analysis"
              icon={TrendingUp}
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrendData}>
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              }
            />

          </motion.div>

          {/* AI Insights */}
          {(currentInsights || hasActiveJob) && (
            <motion.div variants={itemVariants}>
              <InsightsCard
                data={currentInsights}
                isLoading={insightsLoading || isProcessing}
                onRefresh={() => refetchGenerateInsights()}
                onCancel={() => cancelJob()}
                isCancelling={isCancelling}
                jobStatus={jobStatus}
              />
            </motion.div>
          )}

          {/* Charts Section */}
          <motion.div
            variants={itemVariants}
            className="grid gap-6 lg:grid-cols-3"
          >
            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Feedback Trends</CardTitle>
                <CardDescription>
                  Sentiment volume over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="positive"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="neutral"
                        stackId="1"
                        stroke="#71717a"
                        fill="#71717a"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="negative"
                        stackId="1"
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Sentiment Split</CardTitle>
                <CardDescription>
                  Distribution by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                       <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {sentimentData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{item.value}</span>
                        <span className="text-xs">
                          ({Math.round((item.value / overview.total) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feedback Section */}
          <motion.div variants={itemVariants} className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                    <h2 className="text-xl font-semibold tracking-tight">Recent Feedback</h2>
                    <p className="text-sm text-muted-foreground">Latest comments from your users</p>
                 </div>

                 {/* Filters Toolbar */}
                 <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 bg-background"
                        />
                    </div>
                    <Select
                        value={selectedSentiment}
                        onValueChange={(value) =>
                          setSelectedSentiment(value as SentimentType | "all")
                        }
                      >
                        <SelectTrigger className="w-[130px] h-9 bg-background">
                          <SelectValue placeholder="Sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sentiments</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) =>
                          setSelectedCategory(value as FeedbackCategory | "all")
                        }
                      >
                        <SelectTrigger className="w-[130px] h-9 bg-background">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="praise">Praise</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
             </div>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {filteredFeedback.length > 0 ? (
                    filteredFeedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="flex flex-col gap-3 p-4 hover:bg-muted/20 transition-colors sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                             <SentimentBadge sentiment={feedback.sentiment} />
                             <CategoryBadge category={feedback.category} />
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {feedback.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                            <RatingStars rating={feedback.rating} size="sm" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                         <Filter className="h-6 w-6 opacity-50" />
                      </div>
                      <p className="font-medium text-sm">No feedback matches your filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : null}
    </motion.div>
  );
}