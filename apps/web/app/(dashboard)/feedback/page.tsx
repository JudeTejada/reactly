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
import { Search, Download, Trash2, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SentimentType, FeedbackCategory } from "@reactly/shared";

export default function FeedbackPage() {
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<SentimentType | "all">("all");
  const [category, setCategory] = useState<FeedbackCategory | "all">("all");
  const [page, setPage] = useState(1);

  const filters = {
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
      ["Date", "Rating", "Sentiment", "Category", "Text"].join(","),
      ...data.items.map((item) =>
        [
          new Date(item.createdAt).toLocaleDateString(),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">
            Manage and analyze user feedback
          </p>
        </div>
        <Button onClick={handleExport} disabled={!data?.items?.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Feedback</CardTitle>
          <CardDescription>
            Search and filter to find specific feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={sentiment}
              onValueChange={(v) => setSentiment(v as any)}
            >
              <SelectTrigger>
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
              <SelectTrigger>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : !data?.items?.length ? (
            <EmptyState
              icon={Inbox}
              title="No feedback found"
              description="Try adjusting your filters or create a project to start collecting feedback."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDistanceToNow(new Date(feedback.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <RatingStars rating={feedback.rating} size="sm" />
                      </TableCell>
                      <TableCell>
                        <SentimentBadge sentiment={feedback.sentiment} />
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={feedback.category} />
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 text-sm">{feedback.text}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(feedback.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.hasMore && (
                <div className="p-4 flex items-center justify-between border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {data.items.length} of {data.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
