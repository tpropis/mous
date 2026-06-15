"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Flag,
  MessageSquare,
  Sparkles,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toaster";
import { getStories, getTopWriters } from "@/lib/data";
import type {
  Profile,
  ReportContentType,
  ReportStatus,
  Story,
} from "@/lib/types";
import { formatCompact, timeAgo } from "@/lib/utils";

// All mutations here are optimistic + local-only. PRODUCTION wires each action
// to an admin server action backed by the Supabase service-role client.

// ----------------------------------------------------------- Mock reports

interface AdminReport {
  id: string;
  content_type: ReportContentType;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

const MOCK_REPORTS: AdminReport[] = [
  {
    id: "r1",
    content_type: "story",
    reason: "Possible doxxing — contains a real full name",
    status: "open",
    created_at: "2026-06-14T19:12:00Z",
  },
  {
    id: "r2",
    content_type: "review",
    reason: "Harassment in review text",
    status: "open",
    created_at: "2026-06-14T08:40:00Z",
  },
  {
    id: "r3",
    content_type: "profile",
    reason: "Impersonation of another writer",
    status: "reviewing",
    created_at: "2026-06-13T22:05:00Z",
  },
  {
    id: "r4",
    content_type: "story",
    reason: "Graphic content without a content warning",
    status: "resolved",
    created_at: "2026-06-11T15:30:00Z",
  },
];

const REPORT_STATUS_VARIANT: Record<
  ReportStatus,
  "default" | "secondary" | "warn" | "destructive"
> = {
  open: "warn",
  reviewing: "default",
  resolved: "secondary",
  dismissed: "destructive",
};

// ------------------------------------------------------------- Component

export function AdminDashboard() {
  const { toast } = useToast();

  const allStories = useMemo(() => getStories(), []);
  const writers = useMemo(() => getTopWriters(8), []);

  // Optimistic per-entity state.
  const [storyState, setStoryState] = useState<
    Record<string, { removed?: boolean; featured?: boolean }>
  >({});
  const [reports, setReports] = useState<AdminReport[]>(MOCK_REPORTS);
  const [removedReviews, setRemovedReviews] = useState<Set<string>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());

  const openReports = reports.filter(
    (r) => r.status === "open" || r.status === "reviewing",
  ).length;
  const avgRating = useMemo(() => {
    const rated = allStories.filter((s) => s.review_summary);
    if (!rated.length) return "—";
    const sum = rated.reduce((a, s) => a + (s.review_summary?.average ?? 0), 0);
    return (sum / rated.length).toFixed(2);
  }, [allStories]);

  function toggleFeatured(story: Story) {
    setStoryState((prev) => {
      const next = !prev[story.id]?.featured;
      toast({
        title: next ? "Story featured" : "Removed from featured",
        variant: next ? "success" : "default",
      });
      return { ...prev, [story.id]: { ...prev[story.id], featured: next } };
    });
  }

  function toggleRemoved(story: Story) {
    setStoryState((prev) => {
      const next = !prev[story.id]?.removed;
      toast({
        title: next ? "Story removed" : "Story restored",
        variant: next ? "error" : "success",
      });
      return { ...prev, [story.id]: { ...prev[story.id], removed: next } };
    });
  }

  function setReportStatus(id: string, status: ReportStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast({
      title: status === "resolved" ? "Report resolved" : "Report dismissed",
      variant: status === "resolved" ? "success" : "default",
    });
  }

  function removeReview(id: string, author: string) {
    setRemovedReviews((prev) => new Set(prev).add(id));
    toast({ title: `Review by ${author} removed`, variant: "error" });
  }

  function banUser(profile: Profile) {
    setBannedUsers((prev) => new Set(prev).add(profile.id));
    toast({
      title: `${profile.anonymous_name} banned`,
      description: "Their stories are hidden pending review.",
      variant: "error",
    });
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stories">Stories</TabsTrigger>
        <TabsTrigger value="reports">
          Reports
          {openReports > 0 && (
            <span className="ml-1.5 rounded-full bg-neon-amber/20 px-1.5 text-[10px] text-neon-amber">
              {openReports}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>

      {/* -------------------------------------------------------- Overview */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total stories"
            value={formatCompact(allStories.length)}
          />
          <StatCard
            icon={Users}
            label="Total users"
            value={formatCompact(writers.length + 1)}
          />
          <StatCard
            icon={Flag}
            label="Open reports"
            value={String(openReports)}
            accent="text-neon-amber"
          />
          <StatCard icon={Star} label="Avg rating" value={avgRating} />
        </div>

        <Card>
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-primary" />
              Recent activity
            </h3>
            <ul className="mt-4 space-y-3">
              {allStories.slice(0, 6).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <AnonAvatar
                    seed={s.author?.avatar_style ?? s.author_id}
                    size={24}
                  />
                  <span className="truncate text-foreground/90">
                    {s.author?.anonymous_name}
                  </span>
                  <span className="hidden truncate sm:inline">
                    published &ldquo;{s.title}&rdquo;
                  </span>
                  <span className="ml-auto shrink-0 text-xs">
                    {timeAgo(s.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --------------------------------------------------------- Stories */}
      <TabsContent value="stories">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {allStories.map((story) => {
                const state = storyState[story.id] ?? {};
                return (
                  <div
                    key={story.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-medium">
                        {story.title}
                        {state.removed && (
                          <Badge variant="destructive">Removed</Badge>
                        )}
                        {state.featured && (
                          <Badge variant="warn">Featured</Badge>
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {story.author?.anonymous_name} · {story.category} ·{" "}
                        {formatCompact(story.read_count)} reads
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(story)}
                      >
                        <Sparkles className="h-4 w-4" />
                        {state.featured ? "Unfeature" : "Feature"}
                      </Button>
                      <Button
                        variant={state.removed ? "secondary" : "destructive"}
                        size="sm"
                        onClick={() => toggleRemoved(story)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {state.removed ? "Restore" : "Remove"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --------------------------------------------------------- Reports */}
      <TabsContent value="reports" className="space-y-3">
        {reports.map((report) => {
          const settled =
            report.status === "resolved" || report.status === "dismissed";
          return (
            <Card key={report.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {report.content_type}
                    </Badge>
                    <Badge variant={REPORT_STATUS_VARIANT[report.status]}>
                      {report.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(report.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/90">
                    {report.reason}
                  </p>
                </div>
                {!settled && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => setReportStatus(report.id, "resolved")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReportStatus(report.id, "dismissed")}
                    >
                      <XCircle className="h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>

      {/* --------------------------------------------------------- Reviews */}
      <TabsContent value="reviews">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {allStories
                .filter((s) => (s.review_summary?.count ?? 0) > 0)
                .slice(0, 8)
                .map((s) => {
                  const reviewId = `review-${s.id}`;
                  const author = s.author?.anonymous_name ?? "Anonymous";
                  const removed = removedReviews.has(reviewId);
                  return (
                    <div
                      key={reviewId}
                      className="flex items-center gap-3 p-4 text-sm"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">
                          Review on &ldquo;{s.title}&rdquo;
                          {removed && (
                            <Badge variant="destructive" className="ml-2">
                              Removed
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {author} · {s.review_summary?.average.toFixed(1)} ★
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removed}
                        onClick={() => removeReview(reviewId, author)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ----------------------------------------------------------- Users */}
      <TabsContent value="users">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {writers.map((writer) => {
                const banned = bannedUsers.has(writer.id);
                return (
                  <div
                    key={writer.id}
                    className="flex items-center gap-3 p-4"
                  >
                    <AnonAvatar
                      seed={writer.avatar_style}
                      name={writer.anonymous_name}
                      size={36}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-medium">
                        {writer.anonymous_name}
                        {banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatCompact(writer.stats?.total_reads ?? 0)} reads ·{" "}
                        {writer.stats?.stories ?? 0} stories
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={banned}
                        >
                          Ban
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Ban {writer.anonymous_name}?
                          </DialogTitle>
                          <DialogDescription>
                            Their stories will be hidden pending review. This is
                            reversible from the moderation log. No real identity
                            is ever exposed by this action.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="destructive"
                              onClick={() => banUser(writer)}
                            >
                              Ban writer
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// --------------------------------------------------------------- StatCard

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-primary",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="bg-card/40">
      <CardContent className="p-5">
        <Icon className={`h-5 w-5 ${accent}`} />
        <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
