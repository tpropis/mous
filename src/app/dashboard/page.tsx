import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnonAvatar } from "@/components/anon-avatar";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getCurrentProfile, getReviews, getStoriesByAuthor } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Your dashboard — MOUS",
  description: "Your private writer analytics. Only you can see this.",
};

/**
 * The writer dashboard — a private space. Server shell greets the signed-in
 * author by their anonymous name (never a real name) and renders the client
 * analytics surface.
 */
export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  // The dashboard is private — bounce logged-out visitors to auth.
  if (!profile) redirect("/auth?next=/dashboard");

  // Source the author's stories and the reviews across all of them, server-side.
  const stories = await getStoriesByAuthor(profile.id);
  const reviews = (
    await Promise.all(stories.map((s) => getReviews(s.id)))
  ).flat();

  return (
    <div className="container py-10 sm:py-14">
      {/* greeting */}
      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AnonAvatar
            seed={profile.avatar_style}
            name={profile.anonymous_name}
            size={56}
          />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {profile.anonymous_name}
            </h1>
          </div>
        </div>

        <Badge variant="glass" className="self-start px-3 py-1.5 text-xs sm:self-auto">
          <Lock className="h-3.5 w-3.5 text-neon-teal" />
          Private — only you can see this
        </Badge>
      </header>

      <Dashboard profile={profile} stories={stories} reviews={reviews} />
    </div>
  );
}
