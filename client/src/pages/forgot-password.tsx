import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      setDemoCode(data.demoCode);
      setMessage(data.message);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
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
        <div className="mb-6">
          <img src="/logo.png" alt="Zalgo Edutech" className="h-8 w-auto mb-8" />
          <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        {!sent ? (
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
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" />Send Reset Code</>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Reset code generated!</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    In production, this code would be emailed to you. For demo purposes:
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your demo reset code</p>
              <p className="text-3xl font-mono font-bold text-primary tracking-widest" data-testid="text-demo-code">
                {demoCode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Valid for 15 minutes</p>
            </div>

            <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button className="w-full" data-testid="button-go-reset">
                Continue to Reset Password
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6">
          <Link to="/sign-in" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-signin">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
