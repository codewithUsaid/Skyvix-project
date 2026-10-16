import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — Skyvix" },
      { name: "description", content: "Sign in to track your orders, save your wishlist and check out faster at Skyvix" },
      { property: "og:title", content: "Sign In — Skyvix" },
      { property: "og:description", content: "Access your Skyvix account, orders and wishlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("name") ?? "").trim();
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Check your inbox if confirmation is required." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/account" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/account` },
      });
      if (error) throw error;
    } catch {
      toast.error("Google sign-in is unavailable right now");
    }
  };

  return (
    <div className="container-px mx-auto max-w-md py-14">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-extrabold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track orders, save your wishlist and check out faster.
        </p>

        <button
          onClick={google}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <Field label="Full name" name="name" autoComplete="name" />}
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field label="Password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Skyvix?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure checkout ·{" "}
          <Link to="/" className="hover:text-primary">Back to store</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
