import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";

import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import DashboardPage from "@/pages/dashboard";
import CoursePlayerPage from "@/pages/course-player";
import PaymentPage from "@/pages/payment";
import ProfilePage from "@/pages/profile";
import AdminCoursesPage from "@/pages/admin/courses";
import AdminCourseFormPage from "@/pages/admin/course-form";
import AdminLecturesPage from "@/pages/admin/lectures";
import AdminUsersPage from "@/pages/admin/users";
import AdminCouponsPage from "@/pages/admin/coupons";
import AdminChatPage from "@/pages/admin-chat";
import LeaderboardPage from "@/pages/leaderboard";
import AppLayout from "@/components/layouts/app-layout";
import NotFound from "@/pages/not-found";
import { ChatWidget } from "@/components/chat-widget";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false, ...props }: any) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate("/sign-in");
      else if (adminOnly && user.role !== "admin") navigate("/dashboard");
    }
  }, [user, isLoading, adminOnly]);

  if (isLoading) return <LoadingScreen />;
  if (!user) return null;
  if (adminOnly && user.role !== "admin") return null;
  return <Component {...props} />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.role === "admin" ? "/admin/courses" : "/dashboard");
    }
  }, [user, isLoading]);

  if (isLoading) return <LoadingScreen />;
  if (user) return null;
  return <Component />;
}

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      navigate(user?.role === "admin" ? "/admin/courses" : user ? "/dashboard" : "/sign-in");
    }
  }, [user, isLoading]);

  return <LoadingScreen />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in">
        {() => <PublicRoute component={SignInPage} />}
      </Route>
      <Route path="/sign-up">
        {() => <PublicRoute component={SignUpPage} />}
      </Route>
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/dashboard">
        {() => (
          <AppLayout>
            <ProtectedRoute component={DashboardPage} />
          </AppLayout>
        )}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={LeaderboardPage} />}
      </Route>
      <Route path="/course/:courseId">
        {(params) => (
          <ProtectedRoute component={CoursePlayerPage} courseId={params.courseId} />
        )}
      </Route>
      <Route path="/course/:courseId/payment">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={PaymentPage} courseId={params.courseId} />
          </AppLayout>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <AppLayout>
            <ProtectedRoute component={ProfilePage} />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/courses">
        {() => (
          <AppLayout>
            <ProtectedRoute component={AdminCoursesPage} adminOnly />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/courses/new">
        {() => (
          <AppLayout>
            <ProtectedRoute component={AdminCourseFormPage} adminOnly />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/courses/:courseId/edit">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={AdminCourseFormPage} adminOnly courseId={params.courseId} />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/courses/:courseId/lectures">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={AdminLecturesPage} adminOnly courseId={params.courseId} />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AppLayout>
            <ProtectedRoute component={AdminUsersPage} adminOnly />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/coupons">
        {() => (
          <AppLayout>
            <ProtectedRoute component={AdminCouponsPage} adminOnly />
          </AppLayout>
        )}
      </Route>
      <Route path="/admin/chats">
        {() => <ProtectedRoute component={AdminChatPage} adminOnly />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <ChatWidget />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
