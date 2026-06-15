"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoryCard } from "@/components/story/story-card";
import { EmptyState } from "@/components/common/empty-state";
import {
  CATEGORY_NAMES,
  FEED_SORTS,
  LOCATION_OPTIONS,
  MOOD_NAMES,
  TRUTH_TYPES,
} from "@/lib/constants";
import { getRandomStory, getStories, type FeedFilters } from "@/lib/data";
import type { FeedSort } from "@/lib/types";
import { cn } from "@/lib/utils";

/** How many cards to reveal initially and per "load more" page. */
const PAGE_SIZE = 9;

/** Preset reading-length filters (max minutes). */
const LENGTH_OPTIONS: { value: number; label: string }[] = [
  { value: 2, label: "Under 2 min" },
  { value: 5, label: "Under 5 min" },
  { value: 10, label: "Under 10 min" },
  { value: 20, label: "Under 20 min" },
];

/**
 * Sentinel value used by Radix Select for "no filter". Radix forbids empty-string
 * item values, so we use this constant and map it back to `undefined` for queries.
 */
const ANY = "__any__";

interface FeedExperienceProps {
  initialSort?: string;
  initialCategory?: string;
  initialSearch?: string;
  /** When "search", auto-focus the search box (deep-link from the header). */
  initialFocus?: string;
}

export function FeedExperience({
  initialSort,
  initialCategory,
  initialSearch,
  initialFocus,
}: FeedExperienceProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  // --- Filter state ---------------------------------------------------------
  const validSort = FEED_SORTS.some((s) => s.value === initialSort)
    ? (initialSort as FeedSort)
    : "trending";
  const [sort, setSort] = useState<FeedSort>(validSort);
  const [search, setSearch] = useState(initialSearch ?? "");
  const [category, setCategory] = useState(initialCategory ?? ANY);
  const [mood, setMood] = useState(ANY);
  const [truthType, setTruthType] = useState(ANY);
  const [maxMinutes, setMaxMinutes] = useState(ANY);
  const [locationVisibility, setLocationVisibility] = useState(ANY);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // How many cards are currently visible (grows via "Load more" / scroll).
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Deep-link: focus the search field when arriving via the header search icon.
  useEffect(() => {
    if (initialFocus === "search") searchRef.current?.focus();
  }, [initialFocus]);

  // Recompute the result set whenever any filter changes.
  const results = useMemo(() => {
    const filters: FeedFilters = {
      sort,
      search: search.trim() || undefined,
      category: category === ANY ? undefined : category,
      mood: mood === ANY ? undefined : mood,
      truthType: truthType === ANY ? undefined : truthType,
      locationVisibility:
        locationVisibility === ANY ? undefined : locationVisibility,
      maxMinutes: maxMinutes === ANY ? undefined : Number(maxMinutes),
    };
    return getStories(filters);
  }, [sort, search, category, mood, truthType, maxMinutes, locationVisibility]);

  // Reset pagination whenever the result set changes shape.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [results]);

  // Whether any non-default filter (or search) is active.
  const hasActiveFilters =
    category !== ANY ||
    mood !== ANY ||
    truthType !== ANY ||
    maxMinutes !== ANY ||
    locationVisibility !== ANY ||
    search.trim().length > 0;

  function clearFilters() {
    setSearch("");
    setCategory(ANY);
    setMood(ANY);
    setTruthType(ANY);
    setMaxMinutes(ANY);
    setLocationVisibility(ANY);
  }

  /**
   * Simulated infinite scroll. We loop the same result array so there is always
   * "more" to reveal (mirrors an endless server feed without real pagination).
   */
  const shown = useMemo(() => {
    if (results.length === 0) return [];
    return Array.from({ length: Math.min(visible, results.length * 4) }, (_, i) => {
      const story = results[i % results.length];
      return { story, key: `${story.id}-${i}`, index: i };
    });
  }, [results, visible]);

  const canLoadMore = results.length > 0 && shown.length < results.length * 4;

  function loadMore() {
    if (loadingMore || !canLoadMore) return;
    setLoadingMore(true);
    // Brief delay to surface the skeleton row, like a real network fetch.
    window.setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE);
      setLoadingMore(false);
    }, 500);
  }

  // IntersectionObserver sentinel — auto-loads more as it scrolls into view.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !canLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadMore, loadingMore]);

  function goToRandomStory() {
    router.push(`/story/${getRandomStory().id}`);
  }

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------- Controls bar */}
      <div className="space-y-4">
        {/* Sort pills with a sliding active indicator (layoutId). */}
        <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
          {FEED_SORTS.map((s) => {
            const active = s.value === sort;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="feed-sort-active"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span aria-hidden>{s.emoji}</span>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + filter toggle + random */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories, tags, categories…"
              className="h-11 rounded-full pl-10"
              aria-label="Search stories"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={filtersOpen ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-0.5 h-2 w-2 rounded-full bg-primary" aria-hidden />
              )}
            </Button>
            <Button
              type="button"
              variant="brand"
              className="rounded-full"
              onClick={goToRandomStory}
            >
              <Dices className="h-4 w-4" />
              Random story
            </Button>
          </div>
        </div>

        {/* Collapsible filter panel */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="glass rounded-2xl border border-border/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Category */}
                  <FilterSelect
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    anyLabel="Any category"
                    options={CATEGORY_NAMES.map((n) => ({ value: n, label: n }))}
                  />
                  {/* Mood */}
                  <FilterSelect
                    label="Mood"
                    value={mood}
                    onChange={setMood}
                    anyLabel="Any mood"
                    options={MOOD_NAMES.map((n) => ({ value: n, label: n }))}
                  />
                  {/* Truth type */}
                  <FilterSelect
                    label="Truth type"
                    value={truthType}
                    onChange={setTruthType}
                    anyLabel="Any truth type"
                    options={TRUTH_TYPES.map((t) => ({
                      value: t.value,
                      label: t.label,
                    }))}
                  />
                  {/* Length */}
                  <FilterSelect
                    label="Length"
                    value={maxMinutes}
                    onChange={setMaxMinutes}
                    anyLabel="Any length"
                    options={LENGTH_OPTIONS.map((l) => ({
                      value: String(l.value),
                      label: l.label,
                    }))}
                  />
                  {/* Location visibility */}
                  <FilterSelect
                    label="Location"
                    value={locationVisibility}
                    onChange={setLocationVisibility}
                    anyLabel="Any location"
                    options={LOCATION_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {results.length} {results.length === 1 ? "story" : "stories"} match
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ----------------------------------------------------------- Results */}
      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No stories found"
          description="Nothing matches these filters yet. Try clearing them or searching for something else."
          action={
            <Button variant="outline" className="rounded-full" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map(({ story, key, index }) => (
              <StoryCard key={key} story={story} index={index} />
            ))}
          </div>

          {/* Skeleton row while "loading more". */}
          {loadingMore && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Load-more button + IntersectionObserver sentinel. */}
          {canLoadMore && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <Button
                variant="glass"
                size="lg"
                className="rounded-full"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more stories"}
              </Button>
              <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** A single labelled filter dropdown with an "Any" reset option. */
function FilterSelect({
  label,
  value,
  onChange,
  anyLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  anyLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={anyLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{anyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
