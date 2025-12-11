"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAnalyticsOverview, useAnalyticsTrends } from "@/hooks/use-analytics";
import { useProjectStore } from "@/stores/use-project-store";
import { MessageSquare, Star, TrendingUp, TrendingDown } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { sentimentChartConfig, categoryChartConfig } from "@/lib/chart-config";

export default function AnalyticsPage() {
  const { selectedProjectId } = useProjectStore();
  const projectId = selectedProjectId || undefined;

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview({ projectId });
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends({ projectId, days: 30 });

  if (overviewLoading || trendsLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-none shadow-sm bg-card">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!overview || overview.total === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                No data available yet. Start collecting feedback to see analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare pie chart data
  const sentimentPieData = [
    { name: "positive", value: overview.sentimentDistribution.positive },
    { name: "neutral", value: overview.sentimentDistribution.neutral },
    { name: "negative", value: overview.sentimentDistribution.negative },
  ].filter((item) => item.value > 0);

  // Prepare category bar chart data
  const categoryData = Object.entries(overview.categoryBreakdown).map(([name, value]) => {
    const categoryKey = name.toLowerCase();
    const config = categoryChartConfig[categoryKey as keyof typeof categoryChartConfig];
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value,
      fill: config?.color || "hsl(var(--muted-foreground))",
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Insights and trends from your feedback data</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Feedback"
          value={overview.total.toLocaleString()}
          description="All-time feedback collected"
          icon={MessageSquare}
        />
        <StatCard
          title="Average Rating"
          value={overview.averageRating.toFixed(1)}
          description="Out of 5 stars"
          icon={Star}
        />
        <StatCard
          title="Positive Rate"
          value={`${Math.round((overview.sentimentDistribution.positive / overview.total) * 100)}%`}
          description={`${overview.sentimentDistribution.positive} positive`}
          icon={TrendingUp}
        />
        <StatCard
          title="Negative Rate"
          value={`${Math.round((overview.sentimentDistribution.negative / overview.total) * 100)}%`}
          description={`${overview.sentimentDistribution.negative} negative`}
          icon={TrendingDown}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Distribution Pie Chart */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Breakdown of feedback sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sentimentChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={sentimentPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          sentimentChartConfig[entry.name as keyof typeof sentimentChartConfig]
                            ?.color || "#8884d8"
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Feedback by category type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="name"
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted)/0.2)" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends Line Chart */}
      {trends && trends.length > 0 && (
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Sentiment Trends (Last 30 Days)</CardTitle>
            <CardDescription>Track how sentiment changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sentimentChartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-muted-foreground"
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    stroke={
                      sentimentChartConfig.positive?.color || "#22c55e"
                    }
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutral"
                    stroke={
                      sentimentChartConfig.neutral?.color || "#6b7280"
                    }
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke={
                      sentimentChartConfig.negative?.color || "#ef4444"
                    }
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}