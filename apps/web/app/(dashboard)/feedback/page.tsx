"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SentimentBadge } from "@/components/dashboard/sentiment-badge";
import { RatingStars } from "@/components/dashboard/rating-stars";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useFeedback, useDeleteFeedback } from "@/hooks/use-feedback";
import { useProjectStore } from "@/stores/use-project-store";
import { Search, Download, Trash2, Inbox, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SentimentType, FeedbackCategory } from "@reactly/shared";

export default function FeedbackPage() {
  const { selectedProjectId } = useProjectStore();
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<SentimentType | "all">("all");
  const [category, setCategory] = useState<FeedbackCategory | "all">("all");
  const [page, setPage] = useState(1);

  const filters = {
    projectId: selectedProjectId || undefined,
    search: search || undefined,
    sentiment: sentiment !== "all" ? sentiment : undefined,
    category: category !== "all" ? category : undefined,
    page,
    pageSize: 20,
  };

  const { data, isLoading } = useFeedback(filters);
  const deleteMutation = useDeleteFeedback();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (!data?.items) return;

    const csv = [
      ["Date", "User", "Email", "Rating", "Sentiment", "Category", "Text"].join(
        ","
      ),
      ...data.items.map((item) =>
        [
          new Date(item.createdAt).toLocaleDateString(),
          `"${item.userName}"`,
          `"${item.userEmail}"`,
          item.rating,
          item.sentiment,
          item.category,
          `"${item.text.replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Feedback</h1>
          <p className="text-muted-foreground">
            Manage and analyze user feedback
          </p>
        </div>
        <Button onClick={handleExport} disabled={!data?.items?.length} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select
              value={sentiment}
              onValueChange={(v) => setSentiment(v as any)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as any)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                Loading...
                </div>
            ) : !data?.items?.length ? (
                <div className="py-16">
                    <EmptyState
                        icon={Inbox}
                        title="No feedback found"
                        description="Try adjusting your filters or create a project to start collecting feedback."
                    />
                </div>
            ) : (
                <>
                <Table>
                    <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead className="w-[200px]">User</TableHead>
                        <TableHead className="w-[120px]">Rating</TableHead>
                        <TableHead className="w-[120px]">Sentiment</TableHead>
                        <TableHead className="w-[120px]">Category</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead className="text-right w-[80px]"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.items.map((feedback) => (
                        <TableRow key={feedback.id} className="hover:bg-muted/20">
                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(feedback.createdAt), {
                            addSuffix: true,
                            })}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                            <span className="font-medium text-sm">{feedback.userName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={feedback.userEmail}>
                                {feedback.userEmail}
                            </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {feedback.processingStatus === "pending" ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground">
                                Processing
                                </span>
                            </div>
                            ) : feedback.processingStatus === "failed" ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-xs text-red-600">Failed</span>
                            </div>
                            ) : (
                            <RatingStars rating={feedback.rating} size="sm" />
                            )}
                        </TableCell>
                        <TableCell>
                            {feedback.processingStatus === "completed" ? (
                            <SentimentBadge sentiment={feedback.sentiment} />
                            ) : (
                            <span className="text-xs text-muted-foreground">
                                -
                            </span>
                            )}
                        </TableCell>
                        <TableCell>
                            {feedback.processingStatus === "completed" ? (
                            <CategoryBadge category={feedback.category} />
                            ) : (
                            <span className="text-xs text-muted-foreground">
                                -
                            </span>
                            )}
                        </TableCell>
                        <TableCell>
                            <p className="line-clamp-2 text-sm text-foreground/90 leading-relaxed max-w-[400px]" title={feedback.text}>{feedback.text}</p>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleDelete(feedback.id)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

                {data.hasMore && (
                    <div className="p-4 flex items-center justify-between border-t bg-muted/10">
                    <p className="text-xs text-muted-foreground font-medium">
                        Showing {data.items.length} of {data.total} results
                    </p>
                    <div className="flex gap-2">
                        <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Previous
                        </Button>
                        <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!data.hasMore}
                        >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    </div>
                )}
                </>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}