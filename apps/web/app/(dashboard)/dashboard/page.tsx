"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { AuthDebug } from "@/components/auth-debug";
import { SentimentBadge } from "@/components/dashboard/sentiment-badge";
import { RatingStars } from "@/components/dashboard/rating-stars";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useAnalyticsOverview, useRecentFeedback } from "@/hooks/use-analytics";
import { MessageSquare, Star, TrendingUp, Activity, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: recentFeedback, isLoading: feedbackLoading } = useRecentFeedback({ limit: 5 });

  if (overviewLoading || feedbackLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
      </div>
    );
  }

  const hasData = overview && overview.total > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/projects">
          <Button>Create Project</Button>
        </Link>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Inbox}
              title="No feedback yet"
              description="Create a project and embed the widget to start collecting feedback."
              action={{
                label: "Create Your First Project",
                onClick: () => window.location.href = "/projects",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
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
              title="Positive Sentiment"
              value={`${Math.round((overview.sentimentDistribution.positive / overview.total) * 100)}%`}
              description={`${overview.sentimentDistribution.positive} positive`}
              icon={TrendingUp}
            />
            <StatCard
              title="Response Rate"
              value="100%"
              description="All feedback analyzed"
              icon={Activity}
            />
          </div>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Overview</CardTitle>
              <CardDescription>Distribution of sentiment across all feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {overview.sentimentDistribution.positive}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Positive</div>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {overview.sentimentDistribution.neutral}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Neutral</div>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {overview.sentimentDistribution.negative}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Negative</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Feedback</CardTitle>
                  <CardDescription>Latest submissions from your users</CardDescription>
                </div>
                <Link href="/feedback">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentFeedback && recentFeedback.length > 0 ? (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <SentimentBadge sentiment={feedback.sentiment} />
                          <CategoryBadge category={feedback.category} />
                          <RatingStars rating={feedback.rating} size="sm" />
                        </div>
                        <p className="text-sm line-clamp-2">{feedback.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent feedback
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
