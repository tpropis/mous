import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnonAvatar } from "@/components/anon-avatar";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getCurrentProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your dashboard — MOUS",
  description: "Your private writer analytics. Only you can see this.",
};

/**
 * The writer dashboard — a private space. Server shell greets the signed-in
 * author by their anonymous name (never a real name) and renders the client
 * analytics surface.
 */
export default function DashboardPage() {
  const profile = getCurrentProfile();

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

      <Dashboard />
    </div>
  );
}
