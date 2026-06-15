import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AuthForm } from "@/components/auth/auth-form";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Create an anonymous identity or sign in to MOUS. Your email stays private — only a pen name is ever shown.",
};

/**
 * Auth shell. Split layout: a cinematic brand panel on the left and the
 * interactive (client) auth form on the right. On mobile the brand panel
 * collapses and the form centers.
 */
export default function AuthPage() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-30" />
        <div className="absolute left-[10%] top-[-10%] h-[420px] w-[520px] rounded-full bg-neon-violet/20 blur-[120px]" />
        <div className="absolute bottom-0 right-[5%] h-[320px] w-[320px] rounded-full bg-neon-rose/15 blur-[120px]" />
      </div>

      <div className="container grid min-h-[calc(100dvh-4rem)] items-stretch gap-10 py-10 lg:grid-cols-2 lg:gap-16">
        {/* ----------------------------------------------------- Brand panel */}
        <aside className="flex flex-col justify-center text-center lg:text-left">
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <Logo className="justify-center lg:justify-start" showTagline />

            <h1 className="mt-10 text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Write what you could never
              <span className="text-gradient-brand"> post.</span>
            </h1>

            {/* rotating taglines (static render — animated marquee feel via spacing) */}
            <ul className="mt-8 space-y-2.5">
              {BRAND.taglines.slice(0, 4).map((line, i) => (
                <li
                  key={line}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-neon-violet" />
                  <span className="italic">&ldquo;{line}&rdquo;</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 space-y-3 rounded-2xl border border-border bg-card/40 p-5 text-left">
              <p className="text-sm font-medium text-foreground/90">
                Your identity is yours alone.
              </p>
              {[
                { icon: Eye, text: "No real names anywhere on MOUS." },
                { icon: Lock, text: "Your login email stays private forever." },
                {
                  icon: ShieldCheck,
                  text: "You pick a pen name. That's all anyone ever sees.",
                },
              ].map(({ icon: Icon, text }) => (
                <p
                  key={text}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neon-teal" />
                  {text}
                </p>
              ))}
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------- Auth form */}
        <section className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <AuthForm />
            <p className="mt-6 text-center text-sm">
              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Keep reading without an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
