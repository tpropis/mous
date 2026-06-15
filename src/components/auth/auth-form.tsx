"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toaster";
import {
  generateAnonName,
  generateAvatarSeed,
  suggestAnonNames,
} from "@/lib/anon";
// Browser Supabase client for real auth.
import { createClient } from "@/lib/supabase/client";

// --------------------------------------------------------------- Validation

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

// ----------------------------------------------------------------- Component

export function AuthForm() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"signup" | "signin">("signup");

  return (
    <Card className="glass-strong border-border/60">
      <CardContent className="p-6 sm:p-7">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "signup" | "signin")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Create account</TabsTrigger>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <SignUpForm toast={toast} />
          </TabsContent>

          <TabsContent value="signin">
            <SignInForm toast={toast} />
          </TabsContent>
        </Tabs>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-teal" />
          <span>
            We never display your email or any real identity. By continuing you
            agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy approach
            </Link>
            .
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------- Sign in form

function SignInForm({
  toast,
}: {
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInValues) {
    // Real Supabase sign-in.
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast({ title: error.message, variant: "error" });
      return;
    }
    toast({ title: "Welcome back", variant: "success" });
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <Field
        label="Email"
        error={errors.email?.message}
        htmlFor="signin-email"
      >
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
        htmlFor="signin-password"
      >
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Button
        type="submit"
        variant="brand"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

// ----------------------------------------------------------- Sign up form

function SignUpForm({
  toast,
}: {
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  // Anonymous identity picker state — generated, never derived from PII.
  const [name, setName] = useState<string>(() => generateAnonName());
  const [seed, setSeed] = useState<string>(() => generateAvatarSeed());
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    suggestAnonNames(4),
  );

  function shuffleIdentity() {
    const next = suggestAnonNames(4);
    setSuggestions(next);
    setName(next[0]);
    setSeed(generateAvatarSeed());
  }

  async function onSubmit(values: SignUpValues) {
    // Real Supabase sign-up. The anonymous identity travels in user metadata;
    // a DB trigger turns it into the public anonymous profile.
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { anonymous_name: name, avatar_style: seed } },
    });
    if (error) {
      toast({ title: error.message, variant: "error" });
      return;
    }
    toast({ title: `You're in as ${name}`, variant: "success" });
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <Field label="Email" error={errors.email?.message} htmlFor="signup-email">
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Private. Used only to log in — never shown to anyone.
        </p>
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
        htmlFor="signup-password"
      >
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      {/* -------------------------------------------- Anonymous identity */}
      <div className="rounded-2xl border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Your anonymous identity</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={shuffleIdentity}
            className="h-8 gap-1.5 px-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Shuffle
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <motion.div
            key={seed}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnonAvatar seed={seed} name={name} size={48} />
          </motion.div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              This is all anyone will ever see. Your email stays private.
            </p>
          </div>
        </div>

        {/* pen-name suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className={
                "rounded-full border px-3 py-1 text-xs transition-colors " +
                (s === name
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-foreground/80 hover:border-primary/40 hover:bg-accent")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="brand"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create anonymous account
      </Button>
    </form>
  );
}

// ----------------------------------------------------------------- Field

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
