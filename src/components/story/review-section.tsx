"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck, Star } from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/ui/toaster";
import { getCurrentProfile } from "@/lib/data";
import { REVIEW_DIMENSIONS } from "@/lib/constants";
import type { ReviewSummary, StoryReview } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

interface ReviewSectionProps {
  storyId: string;
  reviews: StoryReview[];
  summary?: ReviewSummary;
}

/** Dimension keys map 1:1 to StoryReview score fields. */
const DIMENSION_KEYS = [
  "writing_score",
  "honesty_score",
  "emotion_score",
  "impact_score",
  "entertainment_score",
] as const;

const reviewSchema = z.object({
  rating: z.number().min(1, "Pick an overall rating").max(5),
  writing_score: z.number().min(1).max(5),
  honesty_score: z.number().min(1).max(5),
  emotion_score: z.number().min(1).max(5),
  impact_score: z.number().min(1).max(5),
  entertainment_score: z.number().min(1).max(5),
  review_text: z.string().max(2000).optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

/** Clickable 1-5 star row used for the overall + dimension ratings. */
function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const dim = size === "md" ? "h-7 w-7" : "h-4 w-4";
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                dim,
                "transition-colors",
                filled
                  ? "fill-neon-amber text-neon-amber"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Static star display for an existing review. */
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            value >= n
              ? "fill-neon-amber text-neon-amber"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewSection({ storyId, reviews }: ReviewSectionProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<StoryReview[]>(reviews);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      writing_score: 0,
      honesty_score: 0,
      emotion_score: 0,
      impact_score: 0,
      entertainment_score: 0,
      review_text: "",
    },
  });

  function onSubmit(data: ReviewForm) {
    const me = getCurrentProfile();
    // Optimistically prepend the new review (production would POST to Supabase).
    const optimistic: StoryReview = {
      id: `local-${Date.now()}`,
      story_id: storyId,
      reviewer_id: me.id,
      rating: data.rating,
      writing_score: data.writing_score,
      honesty_score: data.honesty_score,
      emotion_score: data.emotion_score,
      impact_score: data.impact_score,
      entertainment_score: data.entertainment_score,
      review_text: data.review_text?.trim() || null,
      created_at: new Date().toISOString(),
      reviewer: {
        anonymous_name: me.anonymous_name,
        avatar_style: me.avatar_style,
      },
    };
    setItems((prev) => [optimistic, ...prev]);
    setSubmitted(true);
    reset();
    toast({
      title: "Review posted",
      description: "Thanks for sharing how this story landed.",
      variant: "success",
    });
  }

  return (
    <div className="space-y-8">
      {/* ---------------------------------------------------- Leave a review */}
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Leave a review</h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-neon-teal" />
              One review per story
            </span>
          </div>

          {submitted ? (
            <p className="rounded-xl border border-neon-teal/30 bg-neon-teal/5 px-4 py-3 text-sm text-foreground/90">
              You've reviewed this story. Thank you for the honesty.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* overall emotional rating */}
              <div className="space-y-2">
                <Label>How did it make you feel?</Label>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => (
                    <StarRating value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.rating && (
                  <p className="text-xs text-destructive">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              {/* per-dimension ratings */}
              <div className="grid gap-4 sm:grid-cols-2">
                {REVIEW_DIMENSIONS.map((d) => (
                  <div
                    key={d.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <Label className="text-sm text-muted-foreground">
                      {d.label}
                    </Label>
                    <Controller
                      control={control}
                      name={d.key as (typeof DIMENSION_KEYS)[number]}
                      render={({ field }) => (
                        <StarRating
                          size="sm"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-text">Your words (optional)</Label>
                <Controller
                  control={control}
                  name="review_text"
                  render={({ field }) => (
                    <Textarea
                      id="review-text"
                      rows={4}
                      placeholder="What stayed with you?"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Post review
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------ Reviews list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {items.length} {items.length === 1 ? "review" : "reviews"}
        </h3>

        {items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="Be the first to tell this writer how their story landed."
          />
        ) : (
          <ul className="space-y-4">
            {items.map((review, i) => (
              <motion.li
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                className="rounded-2xl border border-border bg-card/50 p-5"
              >
                <div className="flex items-start gap-3">
                  <AnonAvatar
                    seed={review.reviewer?.avatar_style ?? review.reviewer_id}
                    name={review.reviewer?.anonymous_name}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-foreground/90">
                        {review.reviewer?.anonymous_name ?? "Anonymous"}
                      </span>
                      <StarDisplay value={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(review.created_at)}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
