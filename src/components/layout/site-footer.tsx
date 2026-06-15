import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/constants";

const FOOTER_SECTIONS = [
  {
    title: "Explore",
    links: [
      { href: "/feed", label: "Feed" },
      { href: "/explore", label: "Categories" },
      { href: "/missions", label: "Story Missions" },
    ],
  },
  {
    title: "Write",
    links: [
      { href: "/write", label: "Start writing" },
      { href: "/dashboard", label: "Your dashboard" },
      { href: "/auth", label: "Create account" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy#safety", label: "Safety & anonymity" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo showTagline />
          <p className="max-w-xs text-sm text-muted-foreground">
            {BRAND.name} is where people tell the truth because no one knows it&apos;s
            them. Your name stays hidden. Your story does not.
          </p>
        </div>
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MOUS. Stories without names.</p>
          <p className="italic">&ldquo;Everyone has a story. Nobody needs your name.&rdquo;</p>
        </div>
      </div>
    </footer>
  );
}
