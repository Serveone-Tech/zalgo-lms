import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, ShieldCheck, Code2, Brain, Rocket, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
      startCooldown();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      startCooldown();
    } catch (err: any) {
      setError(err.message || "Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10">
          <img src="/logo.png" alt="Zalgo Edutech" className="h-10 w-auto brightness-0 invert" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Back to<br />Learning in Seconds.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Reset your password quickly and get back to building your coding skills today.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: Code2, text: "200+ hands-on coding courses" },
            { icon: Brain, text: "Learn from industry experts" },
            { icon: Rocket, text: "Track progress & earn certificates" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-white/80" />
              </div>
              <span className="text-white/75 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        <Button size="icon" variant="ghost" onClick={toggleTheme} className="absolute top-4 right-4" data-testid="button-theme-toggle">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <img src="/logo.png" alt="Zalgo Edutech" className="h-8 w-auto" />
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Enter your registered email — we'll send a 6-digit OTP to your inbox.
                </p>
              </div>

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

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-code">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending OTP...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" />Send OTP</>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  OTP sent to your email address.
                </p>
              </div>

              <div className="space-y-4">
                {/* Success card */}
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">OTP sent successfully!</p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
                        A 6-digit reset code has been sent to{" "}
                        <span className="font-medium">{email}</span>.{" "}
                        Check your inbox (and spam folder). The code expires in 15 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                    {error}
                  </div>
                )}

                <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
                  <Button className="w-full" data-testid="button-go-reset">
                    Enter OTP & Reset Password
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  data-testid="button-resend"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                  ) : resendCooldown > 0 ? (
                    <><RefreshCw className="w-4 h-4" />Resend in {resendCooldown}s</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" />Resend OTP</>
                  )}
                </Button>
              </div>
            </>
          )}

          <div className="mt-6">
            <Link
              to="/sign-in"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-back-signin"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
