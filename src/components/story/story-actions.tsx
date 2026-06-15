"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Flag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface StoryActionsProps {
  storyId: string;
  title: string;
}

const REPORT_REASONS = [
  { value: "personal_info", label: "Reveals personal information" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "violence", label: "Threats or violence" },
  { value: "spam", label: "Spam or scam" },
  { value: "stolen", label: "Stolen / plagiarized" },
  { value: "other", label: "Something else" },
];

/**
 * Reader-facing actions for a story: bookmark, share, and report.
 * All interactions are optimistic — production would persist to Supabase.
 */
export function StoryActions({ storyId, title }: StoryActionsProps) {
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  function toggleBookmark() {
    setBookmarked((prev) => {
      const next = !prev;
      toast({
        title: next ? "Saved" : "Removed",
        description: next
          ? "Added to your bookmarks."
          : "Removed from your bookmarks.",
        variant: next ? "success" : "default",
      });
      return next;
    });
  }

  async function share() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/story/${storyId}` : "";
    // Prefer the native share sheet on mobile; fall back to clipboard.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url, variant: "success" });
    } catch {
      toast({ title: "Couldn't copy link", variant: "error" });
    }
  }

  function submitReport() {
    if (!reason) {
      toast({ title: "Pick a reason first", variant: "error" });
      return;
    }
    setReportOpen(false);
    setReason("");
    setDetails("");
    toast({
      title: "Report submitted",
      description: "Thank you — our team will review this story.",
      variant: "success",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={bookmarked ? "brand" : "glass"}
          size="sm"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
        >
          <motion.span
            animate={bookmarked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Bookmark
              className={cn("h-4 w-4", bookmarked && "fill-current")}
            />
          </motion.span>
          {bookmarked ? "Saved" : "Save"}
        </Button>

        <Button variant="glass" size="sm" onClick={share}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setReportOpen(true)}
        >
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this story</DialogTitle>
            <DialogDescription>
              Reports are anonymous. Tell us what's wrong and our team will take a
              look.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Details (optional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any context that helps us understand…"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="brand" onClick={submitReport}>
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
