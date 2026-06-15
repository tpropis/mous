"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Check,
  Eye,
  Pencil,
  Save,
  Send,
  Settings2,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import {
  CategoryBadge,
  ContentWarning,
  MoodBadge,
  StoryLocation,
  TruthBadge,
} from "@/components/story/story-meta";
import { PromptGenerator } from "@/components/write/prompt-generator";
import { PublishSuccess } from "@/components/write/publish-success";
// Server action (callable from this client component) — the single write path.
import { publishStory, type PublishInput } from "@/lib/actions";
import {
  CATEGORY_NAMES,
  CONTENT_GUIDELINE,
  LOCATION_OPTIONS,
  MOOD_NAMES,
  TRUTH_TYPES,
} from "@/lib/constants";
import type { LocationVisibility, Story, TruthType } from "@/lib/types";
import { cn, readingTimeMinutes, wordCount } from "@/lib/utils";

/* --------------------------------------------------------------- Zod schema */
/**
 * Validation contract for a story. Title needs a real headline (>= 4 chars),
 * body needs enough substance to be worth reading (>= 80 chars), and the
 * taxonomy fields (category/mood) are required. Conditional location fields are
 * validated with a refinement so e.g. "city" can't be selected without a city.
 */
const storySchema = z
  .object({
    title: z.string().trim().min(4, "Give it a title (at least 4 characters)."),
    body: z
      .string()
      .trim()
      .min(80, "Tell us more — at least 80 characters."),
    category: z.string().min(1, "Pick a category."),
    mood: z.string().min(1, "Pick a mood."),
    tags: z.array(z.string()).max(8, "Up to 8 tags."),
    truthType: z.enum(["true_story", "inspired", "fictionalized", "confession"]),
    locationVisibility: z.enum(["none", "region", "state", "city"]),
    city: z.string().trim(),
    state: z.string().trim(),
    contentWarning: z.boolean(),
    contentWarningLabel: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.locationVisibility === "city" && !data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "Add a city or choose a less specific option.",
      });
    }
    if (
      (data.locationVisibility === "city" ||
        data.locationVisibility === "state") &&
      !data.state
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Add a state.",
      });
    }
  });

type StoryFormValues = z.infer<typeof storySchema>;

const DEFAULT_VALUES: StoryFormValues = {
  title: "",
  body: "",
  category: "",
  mood: "",
  tags: [],
  truthType: "true_story",
  locationVisibility: "none",
  city: "",
  state: "",
  contentWarning: false,
  contentWarningLabel: "",
};

const DRAFT_KEY = "mous:draft";
const FIRST_STORY_KEY = "mous:has-published";

interface StoryEditorProps {
  missionPrompt?: string;
  /** When writing for a mission, the id is forwarded to the publish payload. */
  missionId?: string;
}

export function StoryEditor({ missionPrompt, missionId }: StoryEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [preview, setPreview] = React.useState(false);
  const [tagDraft, setTagDraft] = React.useState("");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [published, setPublished] = React.useState(false);
  const [firstStory, setFirstStory] = React.useState(false);
  const restored = React.useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // Watch the whole form so the side panel, counts and autosave stay live.
  const values = watch();
  const words = wordCount(values.body ?? "");
  const minutes = readingTimeMinutes(values.body ?? "");

  /* ------------------------------------------------------- Autosave / restore */
  // On mount, restore any locally-saved draft so a refresh never loses writing.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoryFormValues>;
        reset({ ...DEFAULT_VALUES, ...parsed });
        setSavedAt(Date.now());
      }
    } catch {
      // ignore malformed drafts
    }
    restored.current = true;
  }, [reset]);

  // Debounced autosave: every change is persisted ~800ms after typing stops,
  // so we write to localStorage rarely instead of on every keystroke.
  React.useEffect(() => {
    if (!restored.current) return;
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
        setSavedAt(Date.now());
      } catch {
        // storage full / unavailable — fail silently
      }
    }, 800);
    return () => window.clearTimeout(handle);
    // Stringify values so the effect re-runs whenever any field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  /* ------------------------------------------------------------------- Tags */
  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    const current = getValues("tags");
    if (current.includes(tag) || current.length >= 8) return;
    setValue("tags", [...current, tag], { shouldDirty: true });
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      getValues("tags").filter((t) => t !== tag),
      { shouldDirty: true },
    );
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagDraft);
    } else if (e.key === "Backspace" && !tagDraft) {
      // backspace on an empty input pops the last chip
      const current = getValues("tags");
      if (current.length) removeTag(current[current.length - 1]);
    }
  };

  /* ---------------------------------------------------------------- Prompts */
  // When the body is empty, "Use it" seeds the story with the prompt as a
  // heading line to get the writer moving; otherwise it's a no-op nudge.
  const usePrompt = (prompt: string) => {
    const body = getValues("body");
    if (!body.trim()) {
      setValue("body", `${prompt}\n\n`, { shouldValidate: false, shouldDirty: true });
    } else {
      toast({ title: "Prompt noted", description: prompt, variant: "info" });
    }
  };

  /* ----------------------------------------------------------------- Actions */
  // Map the form's camelCase fields onto the PublishInput contract (snake_case,
  // tags as string[], mission_id forwarded when present).
  const toPublishInput = (
    data: StoryFormValues,
    status: PublishInput["status"],
  ): PublishInput => ({
    title: data.title,
    body: data.body,
    category: data.category,
    mood: data.mood,
    tags: data.tags,
    truth_type: data.truthType,
    location_visibility: data.locationVisibility,
    city: data.city || null,
    state: data.state || null,
    content_warning: data.contentWarning,
    content_warning_label: data.contentWarningLabel || null,
    mission_id: missionId ?? null,
    status,
  });

  const saveDraft = async () => {
    // Keep the local autosave as an offline safety net…
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
      setSavedAt(Date.now());
    } catch {
      // ignore
    }
    // …then persist the draft through the server action.
    const result = await publishStory(toPublishInput(getValues(), "draft"));
    if (!result.ok) {
      toast({
        title: "Couldn't save draft",
        description: result.error,
        variant: "error",
      });
      return;
    }
    toast({ title: "Draft saved", variant: "success" });
  };

  const onPublish = handleSubmit(async (data) => {
    // Validation has passed — write the story via the server action.
    const result = await publishStory(toPublishInput(data, "published"));
    if (!result.ok) {
      toast({
        title: "Couldn't publish",
        description: result.error,
        variant: "error",
      });
      return;
    }

    // Detect the author's first-ever publish (via localStorage) so we can
    // show extra celebratory copy. Then mark them as a returning author.
    let isFirst = true;
    try {
      isFirst = !window.localStorage.getItem(FIRST_STORY_KEY);
      window.localStorage.setItem(FIRST_STORY_KEY, "1");
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setFirstStory(isFirst);
    setPublished(true);

    // When the action returns a real persisted id (not the demo stub), route to
    // the new story after the success overlay has had a beat to celebrate.
    const newId = result.data?.id;
    if (newId && newId !== "demo") {
      router.push(`/story/${newId}`);
    }
  });

  const writeAnother = () => {
    setPublished(false);
    setPreview(false);
    reset(DEFAULT_VALUES);
    setSavedAt(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // A partial Story shaped for the read-only meta badges in preview.
  const previewStory: Story = {
    id: "preview",
    author_id: "preview",
    title: values.title || "Untitled story",
    body: values.body,
    excerpt: "",
    category: values.category || "Confession",
    mood: values.mood || "Honest",
    tags: values.tags,
    truth_type: values.truthType as TruthType,
    location_visibility: values.locationVisibility as LocationVisibility,
    city: values.city || null,
    state: values.state || null,
    content_warning: values.contentWarning,
    content_warning_label: values.contentWarningLabel || null,
    status: "draft",
    view_count: 0,
    read_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const showLocationFields = values.locationVisibility !== "none";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* =========================================================== Main column */}
      <form onSubmit={onPublish} className="min-w-0 space-y-6">
        {/* Anonymity / safety callout */}
        <div className="flex items-start gap-3 rounded-2xl border border-neon-amber/30 bg-neon-amber/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-neon-amber" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {CONTENT_GUIDELINE}
          </p>
        </div>

        {missionPrompt && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Writing for a mission
            </p>
            <p className="mt-1 font-serif text-lg text-foreground/90">
              “{missionPrompt}”
            </p>
          </div>
        )}

        {preview ? (
          /* ----------------------------------------------------- Preview mode */
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <CategoryBadge category={previewStory.category} />
              <MoodBadge mood={previewStory.mood} />
              <TruthBadge truthType={previewStory.truth_type} />
              <ContentWarning story={previewStory} />
              <StoryLocation story={previewStory} />
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {previewStory.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {words} {words === 1 ? "word" : "words"} · {minutes} min read
            </p>
            <Separator className="my-6" />
            <div className="story-prose whitespace-pre-wrap">
              {values.body || "Nothing written yet."}
            </div>
            {values.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {values.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* -------------------------------------------------------- Edit mode */
          <>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="The night everything changed…"
                className="h-14 text-xl font-semibold"
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Your story</Label>
              <Textarea
                id="body"
                placeholder="Start where it matters. Say what happened."
                className="min-h-[420px] resize-y font-serif text-base leading-relaxed"
                {...register("body")}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <FieldError message={errors.body?.message} />
                <span className="shrink-0 tabular-nums">
                  {words} {words === 1 ? "word" : "words"} · {minutes} min read
                </span>
              </div>
            </div>

            {/* Category + Mood */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.category?.message} />
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <Controller
                  control={control}
                  name="mood"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOOD_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.mood?.message} />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-input bg-background/60 p-2">
                {values.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="group inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-destructive/20"
                  >
                    #{tag}
                    <X className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
                <input
                  id="tags"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  onBlur={() => addTag(tagDraft)}
                  placeholder={
                    values.tags.length ? "Add another…" : "Type and press Enter"
                  }
                  className="min-w-[8rem] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TagIcon className="h-3 w-3" />
                Press Enter to add. Up to 8 tags.
              </p>
              <FieldError message={errors.tags?.message} />
            </div>

            {/* Truth type — segmented radio group */}
            <div className="space-y-2">
              <Label>How true is it?</Label>
              <Controller
                control={control}
                name="truthType"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {TRUTH_TYPES.map((t) => {
                      const active = field.value === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => field.onChange(t.value)}
                          className={cn(
                            "rounded-xl border p-3 text-left transition-colors",
                            active
                              ? "border-primary/60 bg-primary/10"
                              : "border-border bg-card/40 hover:border-primary/30",
                          )}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {active && <Check className="h-3.5 w-3.5 text-primary" />}
                            {t.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {t.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Location visibility */}
            <div className="space-y-3">
              <Label>Location</Label>
              <Controller
                control={control}
                name="locationVisibility"
                render={({ field }) => (
                  <div role="radiogroup" className="flex flex-wrap gap-2">
                    {LOCATION_OPTIONS.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => field.onChange(opt.value)}
                          title={opt.hint}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-colors",
                            active
                              ? "border-primary/60 bg-primary/10 text-foreground"
                              : "border-border bg-card/40 text-muted-foreground hover:border-primary/30",
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />

              {/* Conditional inputs depending on visibility granularity */}
              {showLocationFields && values.locationVisibility === "region" && (
                <p className="text-xs text-muted-foreground">
                  Your story will show as “Somewhere nearby” — placeless but local.
                </p>
              )}
              {(values.locationVisibility === "city" ||
                values.locationVisibility === "state") && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {values.locationVisibility === "city" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs">
                        City
                      </Label>
                      <Input id="city" placeholder="Austin" {...register("city")} />
                      <FieldError message={errors.city?.message} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs">
                      State
                    </Label>
                    <Input id="state" placeholder="Texas" {...register("state")} />
                    <FieldError message={errors.state?.message} />
                  </div>
                </div>
              )}
            </div>

            {/* Content warning */}
            <div className="space-y-3 rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="cw" className="text-sm">
                    Content warning
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Flag heavy themes so readers can opt in.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="contentWarning"
                  render={({ field }) => (
                    <Switch
                      id="cw"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              {values.contentWarning && (
                <Input
                  placeholder="e.g. Discusses loss"
                  {...register("contentWarningLabel")}
                />
              )}
            </div>
          </>
        )}

        {/* Terms reminder + actions */}
        <Separator />
        <p className="text-xs text-muted-foreground">
          By publishing you agree to the{" "}
          <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
            Terms
          </Link>
          . Your story is anonymous — your name is never shown.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="brand" size="lg">
            <Send className="h-4 w-4" />
            Publish
          </Button>
          <Button
            type="button"
            variant="glass"
            size="lg"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? "Keep editing" : "Preview"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={saveDraft}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
        </div>
      </form>

      {/* ============================================================ Side panel */}
      <aside className="lg:sticky lg:top-6 lg:h-fit">
        <div className="space-y-4">
          <PromptGenerator onUse={usePrompt} />

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Settings2 className="h-3.5 w-3.5" />
              At a glance
            </div>
            <dl className="space-y-2 text-sm">
              <SummaryRow label="Words" value={String(words)} />
              <SummaryRow label="Reading time" value={`${minutes} min`} />
              <SummaryRow label="Category" value={values.category || "—"} />
              <SummaryRow label="Mood" value={values.mood || "—"} />
              <SummaryRow
                label="Truth"
                value={
                  TRUTH_TYPES.find((t) => t.value === values.truthType)?.label ?? "—"
                }
              />
              <SummaryRow
                label="Location"
                value={
                  LOCATION_OPTIONS.find(
                    (l) => l.value === values.locationVisibility,
                  )?.label ?? "—"
                }
              />
              <SummaryRow
                label="Tags"
                value={values.tags.length ? String(values.tags.length) : "—"}
              />
            </dl>

            {/* Subtle autosave indicator */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  savedAt ? "bg-neon-teal" : "bg-muted-foreground/40",
                )}
              />
              {savedAt ? "Saved · just now" : "Not saved yet"}
            </div>
          </div>
        </div>
      </aside>

      {/* Celebratory publish overlay (fires confetti on open) */}
      <PublishSuccess
        open={published}
        storyTitle={values.title || "Your story"}
        firstStory={firstStory}
        onWriteAnother={writeAnother}
      />
    </div>
  );
}

/* -------------------------------------------------------------- Small helpers */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive">
      <AlertTriangle className="h-3 w-3" />
      {message}
    </p>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
