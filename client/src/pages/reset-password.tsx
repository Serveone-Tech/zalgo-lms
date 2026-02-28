import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — theme color */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <img src="/logo.png" alt="Zalgo Edutech" className="h-10 w-auto brightness-0 invert" />
        </div>

        {/* Middle: Headline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Secure Your<br />Account.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Set a new strong password and get back to learning on Zalgo Edutech right away.
          </p>
        </div>

        {/* Bottom: Steps */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: ShieldCheck, text: "Enter the 6-digit code from your email" },
            { icon: KeyRound, text: "Choose a strong new password" },
            { icon: CheckCircle2, text: "Sign in and resume your courses" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-white/80" />
              </div>
              <span className="text-white/75 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          className="absolute top-4 right-4"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <img src="/logo.png" alt="Zalgo Edutech" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter the 6-digit code and your new password.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">Password reset!</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Your password has been updated successfully.
                  </p>
                </div>
              </div>
              <Link to="/sign-in">
                <Button className="w-full" data-testid="button-goto-signin">Sign in with new password</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">6-digit reset code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="font-mono text-center tracking-widest text-lg"
                  maxLength={6}
                  data-testid="input-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6} data-testid="button-reset">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Resetting...</> : "Reset Password"}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-6">
              <Link to="/forgot-password" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-forgot">
                <ArrowLeft className="w-3.5 h-3.5" />
                Request a new code
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
