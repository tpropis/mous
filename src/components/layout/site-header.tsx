"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Menu, PenLine, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { AnonAvatar } from "@/components/anon-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS } from "@/lib/constants";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

/** App-wide sticky header with responsive nav and an account menu. */
export function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  // The signed-in profile is resolved server-side and passed in as a prop.
  const me = profile;

  // Sign out via the server action, then return home and refresh server data.
  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  // Header is hidden on the immersive landing page (it has its own nav).
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="hidden sm:flex">
            <Link href="/feed?focus=search" aria-label="Search stories">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="brand" size="sm" className="hidden sm:flex">
            <Link href="/write">
              <PenLine className="h-4 w-4" />
              Write
            </Link>
          </Button>

          {me ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
                  <AnonAvatar seed={me.avatar_style} name={me.anonymous_name} size={36} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {me.anonymous_name}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Your identity stays hidden
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${encodeURIComponent(me.anonymous_name.toLowerCase().replace(/\s+/g, "-"))}`}>
                    Public profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/missions">Story Missions</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/privacy">Privacy</Link>
                </DropdownMenuItem>
                {/* Sign out via the server action, then route home. */}
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Logged out: offer a sign-in link in place of the account menu.
            <Button asChild variant="brand" size="sm">
              <Link href="/auth">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="brand" className="mt-2">
                <Link href="/write" onClick={() => setMobileOpen(false)}>
                  <PenLine className="h-4 w-4" /> Start writing
                </Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
