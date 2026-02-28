import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await signUp(userName, email, password);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-primary/50" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <img src="/logo.png" alt="Zalgo Edutech" className="h-10 w-auto brightness-0 invert" />
        </div>

        {/* Middle: Headline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Your<br />Coding Journey.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Build real skills with expert-led courses. From basics to advanced — learn at your own pace.
          </p>
        </div>

        {/* Bottom: Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            "Access to all published courses",
            "Track progress & earn certificates",
            "Live chat with mentors anytime",
            "Leaderboard & achievement badges",
          ].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/80 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        <Button size="icon" variant="ghost" onClick={toggleTheme} className="absolute top-4 right-4" data-testid="button-theme-toggle">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <img src="/logo.png" alt="Zalgo Edutech" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create account</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign up to start learning today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
                data-testid="input-name"
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</> : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary font-medium hover:underline" data-testid="link-signin">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
