"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { toggleFollow } from "@/lib/actions";

/**
 * Follow toggle. Calls the `toggleFollow` server action, which inserts/deletes
 * a `follows` row under RLS keyed on the authenticated user — never exposing any
 * real identity. The returned `following` flag drives the button state + toast.
 */
export function FollowButton({
  profileId,
  anonymousName,
}: {
  profileId: string;
  anonymousName: string;
}) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);

  async function toggle() {
    const res = await toggleFollow(profileId);
    if (!res.ok || !res.data) {
      toast({
        title: "Couldn't update follow",
        description: res.error,
        variant: "error",
      });
      return;
    }
    const next = res.data.following;
    setFollowing(next);
    toast({
      title: next ? "Following anonymously" : "Unfollowed",
      description: next
        ? `You'll see new stories from ${anonymousName}. They never see who you are.`
        : undefined,
      variant: next ? "success" : "default",
    });
  }

  return (
    <Button
      onClick={toggle}
      variant={following ? "outline" : "brand"}
      size="sm"
      aria-pressed={following}
      className="min-w-[7.5rem]"
    >
      <motion.span
        key={following ? "on" : "off"}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-2"
      >
        {following ? (
          <>
            <Check className="h-4 w-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Follow
          </>
        )}
      </motion.span>
    </Button>
  );
}
