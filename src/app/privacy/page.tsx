import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_GUIDELINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy & Anonymity",
  description:
    "How MOUS protects your identity: no public names or emails, anonymous pen names, fuzzy locations, row-level security, and the tools that keep you safe.",
};

/** Section heading for the legal prose column. */
function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-mt-24 text-2xl font-bold tracking-tight first:mt-0"
    >
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden">
        <div className="absolute left-1/2 top-[-30%] h-[320px] w-[560px] -translate-x-1/2 rounded-full bg-neon-teal/10 blur-[120px]" />
      </div>

      <article className="container max-w-2xl py-14 sm:py-20">
        <Badge variant="glass" className="mb-5">
          <ShieldCheck className="h-3.5 w-3.5 text-neon-teal" />
          Privacy by design
        </Badge>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Privacy &amp; Anonymity
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          MOUS exists so you can tell the truth without being known for it. This
          page explains, plainly, how we keep your identity yours.
        </p>

        <div className="mt-10 leading-relaxed text-foreground/90 [&_p]:mt-4 [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:space-y-2 [&_li]:text-muted-foreground">
          <SectionHeading>The short version</SectionHeading>
          <p>
            We never display your real name or email anywhere on MOUS — there is
            no field for a real name, and your email is used only to log in.
            Everything public is tied to a pen name and an abstract avatar you
            chose, never to who you actually are.
          </p>

          <SectionHeading id="safety">Safety &amp; Anonymity</SectionHeading>
          <p>
            Your anonymity is the product. We protect it in layers:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-foreground/90">No public names or emails.</strong>{" "}
              Public queries cannot return your email or any real identity — the
              data simply isn&apos;t exposed.
            </li>
            <li>
              <strong className="text-foreground/90">Private login.</strong> Your
              email and password authenticate you and nothing more. They are not
              shown to other writers, readers, or moderators.
            </li>
            <li>
              <strong className="text-foreground/90">Anonymous pen names.</strong>{" "}
              You write under a generated pen name like &ldquo;Midnight
              Witness.&rdquo; That, plus a deterministic gradient avatar, is your
              entire public identity.
            </li>
            <li>
              <strong className="text-foreground/90">Fuzzy, optional location.</strong>{" "}
              Location is off by default. If you choose to share it, you pick the
              grain — region, state, or city — never an exact place.
            </li>
            <li>
              <strong className="text-foreground/90">Row-level security.</strong>{" "}
              Every table enforces access rules at the database level, so a
              client can only ever read what it is explicitly allowed to.
            </li>
          </ul>

          <SectionHeading>Reporting, blocking &amp; content warnings</SectionHeading>
          <p>
            Anonymity is not an excuse for harm. You can report any story,
            review, or profile; block writers you don&apos;t want to see; and add
            content warnings to your own stories so readers can opt in. Our
            moderators review reports without ever seeing reporters&apos; or
            authors&apos; real identities.
          </p>

          <SectionHeading>Writing without giving yourself away</SectionHeading>
          <p>
            The editor reminds you of one simple guideline:
          </p>
          <blockquote className="mt-4 rounded-xl border-l-2 border-primary/50 bg-card/40 py-3 pl-4 pr-3 text-foreground/90">
            {CONTENT_GUIDELINE}
          </blockquote>
          <p>
            We can keep your account private, but you are the author of your own
            details. Leave out the ones that point back at you.
          </p>

          <SectionHeading>Data you control</SectionHeading>
          <p>
            You can change your pen name and avatar, edit or delete your stories,
            and delete your account. Deleting your account removes your public
            profile and content. We keep only what we&apos;re legally required to,
            for as long as we&apos;re required to.
          </p>

          <SectionHeading>Questions</SectionHeading>
          <p>
            Read our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
            </Link>{" "}
            for the rules of the road, or revisit the{" "}
            <Link href="/privacy#safety" className="text-primary hover:underline">
              Safety &amp; Anonymity
            </Link>{" "}
            section any time.
          </p>
        </div>

        <p className="mt-12 rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
          This page is a plain-language template describing MOUS&apos;s approach to
          privacy. It is not legal advice and is not a substitute for a reviewed
          privacy policy.
        </p>
      </article>
    </div>
  );
}
