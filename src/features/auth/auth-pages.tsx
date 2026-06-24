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
import { roles } from "@/config/app-roles";
import { roleRoutes } from "@/config/roles";
import { themePresets } from "@/config/theme";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const validUser = "doctor@hospital.com";
const validPassword = "doctor123";
const authStorageKey = "hk-general-auth";
const accessScopeKey = "plasmit-access-scope";
const roleChangeEvent = "plasmit-role-change";
type LoginScope = "doctor-ipd" | "admin";

function getRoleRoute(role: Role) {
  return roleRoutes[role] ?? "/dashboard";
}

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
  const [loginScope, setLoginScope] = React.useState<LoginScope>("admin");
  const router = useRouter();
  const loginRole: Role = loginScope === "doctor-ipd" ? "Doctor IPD" : "Hospital Admin";

  React.useEffect(() => {
    if (window.localStorage.getItem(authStorageKey) === "true") {
      const savedScope = window.localStorage.getItem(accessScopeKey);
      if (savedScope === "doctor-ipd") {
        router.replace(getRoleRoute("Doctor IPD"));
        return;
      }
      const savedRole = window.localStorage.getItem("plasmit-role") as Role | null;
      router.replace(savedRole && roles.includes(savedRole) ? getRoleRoute(savedRole) : "/dashboard");
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
      window.localStorage.setItem(accessScopeKey, loginScope);
      window.localStorage.setItem("plasmit-role", loginRole);
      window.localStorage.setItem("hk-general-remember", remember ? "true" : "false");
      window.dispatchEvent(new Event(roleChangeEvent));
      setTransitioning(true);
      toast.success("Access granted");
      window.setTimeout(() => {
        router.push(getRoleRoute(loginRole));
      }, 320);
    }, 1000);
  }

  return (
    <main className="min-h-dvh bg-[#f4f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.78fr)]">
        <section className="hidden min-h-full flex-col justify-between border-r border-slate-200 bg-[#f8fafc] p-8 lg:flex xl:p-10">
          <div>
            <Image
              src="/plasmit-sidebar-logo.webp"
              alt="Plasmit Healthcare IT Vector logo"
              width={218}
              height={88}
              priority
              className="h-auto w-[205px] object-contain"
            />
            <div className="mt-10 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Enterprise HMS access
              </div>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950">
                Secure hospital workspace for every clinical role.
              </h1>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                Sign in once, choose your assigned role, and continue to the correct dashboard with protected session handling.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <LoginTrustRow icon={ShieldCheck} title="Role-based access" detail="Routes open according to the selected hospital role." />
            <LoginTrustRow icon={Stethoscope} title="Clinical workflow ready" detail="Doctor, nursing, ICU, diagnostics, billing, and admin workspaces supported." />
            <LoginTrustRow icon={Smartphone} title="Audit-friendly session" detail="Remember device and MFA flows are prepared for backend integration." />
          </div>
        </section>

        <section className="flex min-w-0 items-center justify-center p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <Image
                src="/plasmit-sidebar-logo.webp"
                alt="Plasmit Healthcare IT Vector logo"
                width={200}
                height={82}
                priority
                className="h-auto w-[190px] object-contain"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">Sign in</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">Choose access type, then open your HMS workspace.</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
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
                      placeholder="doctor@hospital.com"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-11 font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20"
                    />
                  </div>
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Access type</span>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      className={cn(
                        "h-10 rounded-md text-sm font-bold transition",
                        loginScope === "doctor-ipd" ? "bg-white text-[#2563eb] shadow-sm" : "text-slate-600 hover:bg-white/70",
                      )}
                      type="button"
                      onClick={() => setLoginScope("doctor-ipd")}
                    >
                      Doctor IPD
                    </button>
                    <button
                      className={cn(
                        "h-10 rounded-md text-sm font-bold transition",
                        loginScope === "admin" ? "bg-white text-[#2563eb] shadow-sm" : "text-slate-600 hover:bg-white/70",
                      )}
                      type="button"
                      onClick={() => setLoginScope("admin")}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-slate-700">Password</span>
                  <div className="relative min-w-0">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-11 pr-12 font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20"
                    />
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#2563eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 active:scale-95"
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
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? "Verifying access..." : "Login"}
                </button>
              </form>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                Demo access: doctor@hospital.com / doctor123
              </div>
            </div>

            <div className="mt-4 text-center text-xs font-medium text-slate-500">
              Support: securitydesk@plasmit.care | +91 20 4000 2211
            </div>
          </div>
        </section>
      </div>

      {transitioning ? <div className="fixed inset-0 z-50 animate-[dashboardReveal_420ms_ease_both] bg-white" /> : null}
    </main>
  );
}

function LoginTrustRow({ detail, icon: Icon, title }: { detail: string; icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-950">{title}</div>
        <div className="mt-0.5 text-xs font-medium leading-5 text-slate-500">{detail}</div>
      </div>
    </div>
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
