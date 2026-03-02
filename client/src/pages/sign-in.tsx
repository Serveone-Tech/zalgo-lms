import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, GraduationCap, Users, BookOpen, Star } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function SignInPage() {
  const { signIn } = useAuth();
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/google/status").then(r => r.json()).then(d => setGoogleEnabled(d.enabled)).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_failed") setError("Google login failed. Please try again.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
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
            Code. Learn.<br />Grow Every Day.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Join thousands of learners mastering real-world skills through structured, hands-on courses.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Active Learners", value: "10K+" },
            { icon: BookOpen, label: "Courses", value: "200+" },
            { icon: Star, label: "Completion Rate", value: "92%" },
            { icon: GraduationCap, label: "Instructors", value: "50+" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
              </div>
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
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Zalgo Edutech" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your Zalgo Edutech account</p>
          </div>

          {googleEnabled && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => { window.location.href = "/api/auth/google"; }}
                data-testid="button-google-signin"
              >
                <SiGoogle className="w-4 h-4 text-red-500" />
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or sign in with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-signin">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-primary font-medium hover:underline" data-testid="link-signup">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-muted/60 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-muted-foreground">Admin: admin@lms.com / admin123</p>
            <p className="text-xs text-muted-foreground">User: rahul@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
