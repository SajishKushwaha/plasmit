"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Cross, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, Moon, ShieldCheck, Smartphone, Stethoscope, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useUiPreference } from "@/components/providers/ui-preference-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { themePresets } from "@/config/theme";
import { cn } from "@/lib/utils";

const validUser = "doctor@hospital.com";
const validPassword = "doctor123";
const authStorageKey = "hk-general-auth";

function AuthFrame({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { preference, setPreference } = useUiPreference();

  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cross className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Plasmit Hospital</div>
              <div className="text-xs text-muted-foreground">Staff access console</div>
            </div>
          </div>
          <Button
            size="icon"
            variant="outline"
            aria-label="Toggle theme mode"
            onClick={() => setPreference({ ...preference, mode: preference.mode === "dark" ? "light" : "dark" })}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
            <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
              {themePresets.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  className={cn(
                    "h-6 w-6 rounded-full border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preference.colorPreset === preset.id && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: `hsl(${preset.hsl})` }}
                  onClick={() => setPreference({ ...preference, colorPreset: preset.id })}
                  aria-label={`Use ${preset.label} theme`}
                  type="button"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 text-center text-xs text-muted-foreground">
          {footer}
          <div>Support: securitydesk@plasmit.care • +91 20 4000 2211</div>
        </div>
      </div>
    </main>
  );
}

export function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [transitioning, setTransitioning] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (window.localStorage.getItem(authStorageKey) === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      if (username.trim().toLowerCase() !== validUser || password !== validPassword) {
        setLoading(false);
        setError("Invalid username or password");
        return;
      }
      window.localStorage.setItem(authStorageKey, "true");
      window.localStorage.setItem("plasmit-role", "Doctor");
      window.localStorage.setItem("hk-general-remember", remember ? "true" : "false");
      setTransitioning(true);
      toast.success("Access granted");
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 320);
    }, 1000);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#eef6ff] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_88%_14%,rgba(191,219,254,0.38),transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eff6ff_48%,#eaf3ff_100%)]" />
      <div className="relative mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-6 lg:grid-cols-2 lg:px-8">
        <section className="hidden min-h-[calc(100dvh-3rem)] flex-col justify-center overflow-hidden rounded-[32px] border border-white/75 bg-white/45 p-8 shadow-[0_24px_70px_rgba(22,78,99,0.10)] backdrop-blur lg:flex xl:p-10">
          <div className="flex flex-1 items-center justify-center py-6">
            <div className="relative w-full max-w-[520px]">
              <div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-[#bfdbfe]/70 blur-3xl" />
              <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-blue-200/70 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/85 bg-white/80 p-7 shadow-[0_24px_60px_rgba(22,78,99,0.12)] backdrop-blur">
                <Image
                  src="/hk-general-illustration.png"
                  alt="Doctors reviewing hospital care workflow"
                  width={690}
                  height={495}
                  priority
                  className="mx-auto h-auto w-full max-w-[360px] object-contain"
                />
                <div className="mt-6 max-w-lg">
                  <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-950">Clinical access for trusted hospital teams</h2>
                  <p className="mt-3 max-w-md text-sm font-medium leading-6 text-slate-600">
                    Securely open patient rounds, diagnostics, billing, and operational workflows from one clean ERP workspace.
                  </p>
                </div>
                <div className="mt-5 grid max-w-lg grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-[#2563eb]" />
                    <div className="mt-2 text-sm font-bold text-slate-900">Protected Session</div>
                    <div className="text-xs font-medium text-slate-500">Local verified access</div>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
                    <Stethoscope className="h-5 w-5 text-[#2563eb]" />
                    <div className="mt-2 text-sm font-bold text-slate-900">Doctor Dashboard</div>
                    <div className="text-xs font-medium text-slate-500">Ready after login</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100dvh-3rem)] min-w-0 items-center justify-center px-0 py-6 sm:px-4 lg:px-8">
          <div className="w-[calc(100vw-2rem)] min-w-0 max-w-[455px] animate-[loginCardIn_560ms_cubic-bezier(.2,.8,.2,1)_both] sm:w-full">
            <div className="min-w-0 rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(15,82,92,0.16)] backdrop-blur sm:p-8">
              <div className="mb-7 text-center">
                <Image
                  src="/plasmit-sidebar-logo.webp"
                  alt="Plasmit Healthcare IT Vector logo"
                  width={220}
                  height={89}
                  priority
                  className="mx-auto mb-5 h-auto w-[210px] object-contain"
                />
                <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">Welcome Back Doctor!</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Let&apos;s get you logged in</p>
              </div>

              {error ? (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={submit}>
                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-slate-700">Email/Username</span>
                  <div className="relative min-w-0">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      name="username"
                      autoComplete="username"
                      placeholder=""
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 font-medium text-slate-900 shadow-inner shadow-slate-200/30 transition hover:border-blue-200 hover:bg-white focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20"
                    />
                  </div>
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-slate-700">Password</span>
                  <div className="relative min-w-0">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder=""
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 pr-12 font-medium text-slate-900 shadow-inner shadow-slate-200/30 transition hover:border-blue-200 hover:bg-white focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 active:scale-95"
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <div className="flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                    <input
                      className="h-4 w-4 rounded border-slate-300 accent-[#2563eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    Remember me
                  </label>
                  <Link className="font-semibold text-[#2563eb] underline-offset-4 transition hover:text-[#1d4ed8] hover:underline" href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <button
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#38bdf8] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? "Verifying access..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {transitioning ? <div className="fixed inset-0 z-50 animate-[dashboardReveal_420ms_ease_both] bg-white" /> : null}
    </main>
  );
}

export function ForgotPasswordPage() {
  return (
    <AuthFrame title="Recover Password" description="Send a recovery code to the registered staff email or mobile." footer={<Link className="font-medium text-primary" href="/login">Back to login</Link>}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Reset code sent in static preview");
        }}
      >
        <label className="space-y-1 text-sm">
          <span className="font-medium">Email, username, or mobile</span>
          <Input autoComplete="username" placeholder="ananya.sharma@plasmit.care" />
        </label>
        <Button className="w-full">
          <Mail className="h-4 w-4" />
          Send reset code
        </Button>
      </form>
    </AuthFrame>
  );
}

export function ResetPasswordPage() {
  return (
    <AuthFrame title="Reset Password" description="Use the verification code and set a compliant password." footer={<Link className="font-medium text-primary" href="/login">Back to login</Link>}>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); toast.success("Password reset validated in static preview"); }}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Verification code</span>
          <Input inputMode="numeric" placeholder="••••••" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">New password</span>
          <Input type="password" placeholder="Minimum 12 characters" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Confirm password</span>
          <Input type="password" placeholder="Re-enter new password" />
        </label>
        <div className="rounded-md bg-surface-muted p-2 text-xs text-muted-foreground">Strength policy: 12+ chars, uppercase, lowercase, number, and special character.</div>
        <Button className="w-full">
          <KeyRound className="h-4 w-4" />
          Reset password
        </Button>
      </form>
    </AuthFrame>
  );
}

export function VerifyOtpPage() {
  const router = useRouter();
  return (
    <AuthFrame title="MFA Verification" description="Confirm the second factor before opening the HMS workspace." footer={<Link className="font-medium text-primary" href="/login">Use another account</Link>}>
      <AlertBanner icon={Smartphone} title="Code sent">Delivery method: SMS and email fallback. Authenticator app support is prepared for backend integration.</AlertBanner>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); toast.success("MFA verified in static preview"); router.push("/dashboard"); }}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Verification code</span>
          <Input inputMode="numeric" maxLength={6} placeholder="Enter 6 digit code" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input className="h-4 w-4 rounded border-input accent-primary" type="checkbox" />
          Trust this device for 14 days
        </label>
        <Button className="w-full">
          <CheckCircle2 className="h-4 w-4" />
          Verify and continue
        </Button>
        <Button className="w-full" variant="outline" type="button" onClick={() => toast.info("Resend available after cooldown")}>
          Resend code
        </Button>
      </form>
    </AuthFrame>
  );
}
