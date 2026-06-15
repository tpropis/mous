import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_GUIDELINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The rules of MOUS: acceptable use, no doxxing, content ownership, and why anonymity is not a shield for abuse.",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 scroll-mt-24 text-2xl font-bold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export default function TermsPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden">
        <div className="absolute left-1/2 top-[-30%] h-[320px] w-[560px] -translate-x-1/2 rounded-full bg-neon-violet/10 blur-[120px]" />
      </div>

      <article className="container max-w-2xl py-14 sm:py-20">
        <Badge variant="glass" className="mb-5">
          <Scale className="h-3.5 w-3.5 text-neon-violet" />
          The agreement
        </Badge>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          MOUS is built on trust between strangers. These terms keep it that way.
          By using MOUS you agree to them.
        </p>

        <div className="mt-10 leading-relaxed text-foreground/90 [&_p]:mt-4 [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:space-y-2 [&_li]:text-muted-foreground">
          <SectionHeading>Acceptable use</SectionHeading>
          <p>
            Write honestly, write your own story, and treat other writers as
            people. You may not use MOUS to harass, threaten, defame, spam, or
            post illegal content. Stories should be your own personal stories —
            not someone else&apos;s private life dressed up as fiction.
          </p>

          <SectionHeading>No doxxing or real personal info of others</SectionHeading>
          <p>
            Never publish real names, addresses, phone numbers, workplaces, or
            other identifying details of real people without their permission.
            This is the line we take most seriously. As the editor reminds you:
          </p>
          <blockquote className="mt-4 rounded-xl border-l-2 border-primary/50 bg-card/40 py-3 pl-4 pr-3 text-foreground/90">
            {CONTENT_GUIDELINE}
          </blockquote>

          <SectionHeading>Anonymity is not a shield for abuse</SectionHeading>
          <p>
            Being anonymous lets you be honest — it does not let you be cruel.
            We can and will remove content and suspend accounts that target,
            endanger, or harass others, even though no real identity is ever
            displayed. Moderation happens without exposing anyone&apos;s identity.
          </p>

          <SectionHeading>Content ownership</SectionHeading>
          <p>
            You own what you write. By publishing on MOUS you grant us a limited
            license to host, display, and distribute your story within the
            platform so people can read it. You can edit or delete your stories
            at any time, and deleting your account removes your public content.
          </p>

          <SectionHeading>Moderation rights</SectionHeading>
          <p>
            We may remove stories, reviews, or profiles; resolve or dismiss
            reports; and suspend or ban accounts that break these terms. We aim to
            be fair and consistent, and to keep moderation blind to real-world
            identity.
          </p>

          <SectionHeading>Before you publish</SectionHeading>
          <p>
            Once a story is out, people will read it. Make sure it&apos;s yours to
            tell, that it doesn&apos;t expose anyone who didn&apos;t consent, and
            that you&apos;ve added a content warning if it needs one. When in
            doubt, leave the identifying detail out.
          </p>

          <SectionHeading>Privacy</SectionHeading>
          <p>
            How we protect your identity is described in our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy &amp; Anonymity
            </Link>{" "}
            page, which is part of these terms.
          </p>
        </div>

        <p className="mt-12 rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
          This page is a plain-language template describing how MOUS expects the
          platform to be used. It is not legal advice and is not a substitute for
          reviewed terms of service.
        </p>
      </article>
    </div>
  );
}
