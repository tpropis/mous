import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getCurrentProfile, getStories, getTopWriters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Admin · The Curator",
  robots: { index: false, follow: false },
};

/**
 * Admin shell.
 *
 * PRODUCTION GATE: this route must be protected server-side before rendering.
 * The real check looks roughly like:
 *
 *   const profile = await getCurrentProfile();        // from the session
 *   if (!profile?.is_admin) notFound();               // hide the route entirely
 *
 * Mutations below run through admin-only server actions using the Supabase
 * service-role client, and every table is additionally protected by RLS so a
 * forged client request can never reach moderator data.
 */
export default async function AdminPage() {
  // Server-side admin gate: resolve the session profile and check is_admin.
  const profile = await getCurrentProfile();
  const authorized = profile?.is_admin === true;

  // Only load moderation data once we know the viewer is an admin.
  const [stories, writers] = authorized
    ? await Promise.all([getStories(), getTopWriters(20)])
    : [[], []];

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="warn" className="mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            Restricted · admin only
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Admin <span className="text-gradient-brand">· The Curator</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Moderate stories, resolve reports, and keep MOUS safe and anonymous.
            In production this dashboard is gated by <code>is_admin</code> plus
            row-level security and the service-role client.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {authorized ? (
          <AdminDashboard stories={stories} writers={writers} />
        ) : (
          <Card className="bg-card/40 p-8 text-center">
            <h2 className="text-lg font-semibold">Not authorized</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You need an admin account to view this dashboard.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
