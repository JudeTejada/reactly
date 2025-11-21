"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Inbox,
  Filter,
  Lightbulb,
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
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: recentFeedback, isLoading: feedbackLoading } =
    useRecentFeedback({ limit: 50 });
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends({
    days: 30,
  });
  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useInsights();

  const {
    data: generatedInsights,
    isLoading: generateInsightsLoading,
    refetch: refetchGenerateInsights,
    hasActiveJob,
    isProcessing,
    jobStatus,
    createJob,
    cancelJob,
  } = useGenerateInsights();

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

  if (overviewLoading || feedbackLoading || trendsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
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
  const feedbackTrendData = chartData.slice(-7); // Last 7 days for mini chart
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
          color: "#10b981",
        },
        {
          name: "Neutral",
          value: overview.sentimentDistribution.neutral,
          color: "#64748b",
        },
        {
          name: "Negative",
          value: overview.sentimentDistribution.negative,
          color: "#ef4444",
        },
      ]
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's your feedback analytics.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refetchGenerateInsights()}
                disabled={generateInsightsLoading || hasActiveJob}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                {hasActiveJob
                  ? jobStatus?.status === "processing"
                    ? "Processing..."
                    : "In Queue..."
                  : generateInsightsLoading
                    ? "Starting..."
                    : "Generate Insights"}
              </Button>
              <Link href="/projects">
                <Button>Create Project</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {!hasData ? (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Inbox}
                  title="No feedback yet"
                  description="Create a project and embed the widget to start collecting feedback."
                  action={{
                    label: "Create Your First Project",
                    onClick: () => (window.location.href = "/projects"),
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : hasData && overview ? (
          <>
            {/* Stats Overview */}
            <motion.div variants={itemVariants}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Feedback"
                  value={overview.total.toLocaleString()}
                  description="All-time feedback collected"
                  icon={MessageSquare}
                  chart={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={feedbackTrendData}>
                        <defs>
                          <linearGradient
                            id="miniFeedbackGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#miniFeedbackGradient)"
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
                          strokeWidth={2.5}
                          dot={false}
                          strokeLinecap="round"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  }
                />
                <StatCard
                  title="Positive Sentiment"
                  value={`${Math.round((overview.sentimentDistribution.positive / overview.total) * 100)}%`}
                  description={`${overview.sentimentDistribution.positive} positive`}
                  icon={TrendingUp}
                  chart={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sentimentTrendData}>
                        <defs>
                          <linearGradient
                            id="miniSentimentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="positive"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#miniSentimentGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  }
                />
                <StatCard
                  title="Categories"
                  value={Object.keys(overview.categoryBreakdown).length}
                  description="Different feedback types"
                  icon={Activity}
                  chart={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <Bar
                          dataKey="count"
                          fill="#8b5cf6"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                />
              </div>
            </motion.div>

            {/* AI Insights */}
            {(currentInsights || hasActiveJob) && (
              <motion.div variants={itemVariants}>
                <InsightsCard
                  data={currentInsights}
                  isLoading={insightsLoading || isProcessing}
                  onRefresh={() => refetchGenerateInsights()}
                  jobStatus={jobStatus}
                />
              </motion.div>
            )}

            {/* Charts Section */}
            <motion.div
              variants={itemVariants}
              className="grid lg:grid-cols-3 gap-6"
            >
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Feedback Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Last 30 days sentiment analysis
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorPositive"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorNegative"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorNeutral"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#64748b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#64748b"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="positive"
                          stackId="1"
                          stroke="#10b981"
                          fill="url(#colorPositive)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="neutral"
                          stackId="1"
                          stroke="#64748b"
                          fill="url(#colorNeutral)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="negative"
                          stackId="1"
                          stroke="#ef4444"
                          fill="url(#colorNegative)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Split</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Overall distribution
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {sentimentData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.value}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((item.value / overview.total) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content: Feedback List & Filters */}
            <motion.div
              variants={itemVariants}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Left: All Feedback */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Feedback</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filteredFeedback.length} of {recentFeedback?.length || 0}{" "}
                      items
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {filteredFeedback.length > 0 ? (
                        filteredFeedback.map((feedback) => (
                          <motion.div
                            key={feedback.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:border-primary/20"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <SentimentBadge
                                    sentiment={feedback.sentiment}
                                  />
                                  <CategoryBadge category={feedback.category} />
                                  <RatingStars
                                    rating={feedback.rating}
                                    size="sm"
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(
                                    new Date(feedback.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">
                                {feedback.text}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            No feedback matches your filters
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Filters & Category Breakdown */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sentiment</label>
                      <Select
                        value={selectedSentiment}
                        onValueChange={(value) =>
                          setSelectedSentiment(value as SentimentType | "all")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) =>
                          setSelectedCategory(value as FeedbackCategory | "all")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="improvement">
                            Improvement
                          </SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="praise">Praise</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Breakdown by type
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(overview.categoryBreakdown).map(
                        ([category, count]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <CategoryBadge
                                category={category as FeedbackCategory}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {count}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round((count / overview.total) * 100)}%)
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
