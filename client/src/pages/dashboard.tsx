import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, CheckCircle2, Tag, Play, ShoppingCart, Copy, Check,
  Trophy, Star, Users, Clock, Flame, Target, TrendingUp, Zap,
  Monitor, Database, Palette, Cloud, Code2, ChevronRight, BarChart3
} from "lucide-react";
import { useState } from "react";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  shortDescription?: string;
  progress?: number;
  instructorName?: string;
  lectureCount?: number;
  studentCount?: number;
  level?: string;
  rating?: number;
  enrolledAt?: string;
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountPercent: number;
  expiresAt?: string;
}

const categories = [
  { label: "All", icon: Zap },
  { label: "Web Development", icon: Monitor },
  { label: "Data Science", icon: Database },
  { label: "Design", icon: Palette },
  { label: "DevOps", icon: Cloud },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-44 w-full rounded-t-lg rounded-b-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

function EnrolledCourseCard({ course }: { course: Course }) {
  const [, navigate] = useLocation();
  const progress = course.progress ?? 0;
  const isCompleted = progress >= 100;

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow" data-testid={`card-enrolled-${course.id}`}>
      <div className="relative h-40 overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white gap-1 text-xs">
              <Trophy className="w-3 h-3" /> Completed
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/80 text-xs font-medium">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-primary" />
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{course.instructorName}</p>
        <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2">{course.title}</h3>
        <Button
          size="sm"
          className="w-full gap-2"
          onClick={() => navigate(`/course/${course.id}`)}
          data-testid={`button-resume-${course.id}`}
        >
          <Play className="w-3 h-3" />
          {isCompleted ? "Review Course" : "Continue Learning"}
        </Button>
      </CardContent>
    </Card>
  );
}

function BrowseCourseCard({ course }: { course: Course }) {
  const [, navigate] = useLocation();

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-browse-${course.id}`}
      onClick={() => navigate(`/course/${course.id}/payment`)}>
      <div className="relative h-40 overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-primary text-primary-foreground text-xs">{course.category}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{course.instructorName}</p>
        {course.rating && <StarRating rating={course.rating} />}
        <div className="flex items-center gap-3 mt-2 mb-3 text-xs text-muted-foreground">
          {course.lectureCount && (
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lectureCount} lectures</span>
          )}
          {course.level && (
            <span className="flex items-center gap-1"><Target className="w-3 h-3" />{course.level}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base text-foreground">₹{course.price.toLocaleString()}</span>
          <Button
            size="sm"
            className="gap-1"
            onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}/payment`); }}
            data-testid={`button-buy-${course.id}`}
          >
            <ShoppingCart className="w-3 h-3" />
            Enroll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContinueLearningHero({ course }: { course: Course }) {
  const [, navigate] = useLocation();
  const progress = course.progress ?? 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-52 cursor-pointer group"
      onClick={() => navigate(`/course/${course.id}`)}
      data-testid="hero-continue-learning"
    >
      {course.thumbnail && (
        <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div>
          <Badge className="bg-primary text-primary-foreground text-xs mb-3">Continue Learning</Badge>
          <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">{course.title}</h2>
          <p className="text-white/70 text-sm mt-1">{course.instructorName}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">{progress}% complete</span>
            <span className="text-white/60 text-xs">Keep going!</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-primary mb-4" />
          <Button
            size="sm"
            className="gap-2 bg-white text-primary hover:bg-white/90"
            onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
}

function CouponBanner({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid={`banner-coupon-${coupon.id}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{coupon.title} — <span className="text-primary">{coupon.discountPercent}% OFF</span></p>
          <p className="text-xs text-muted-foreground">{coupon.description || `Use code to save ${coupon.discountPercent}% on any course`}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="px-3 py-1.5 rounded-lg border border-dashed border-primary/40 bg-background">
          <span className="font-mono font-bold text-sm text-primary">{coupon.code}</span>
        </div>
        <Button size="icon" variant="ghost" onClick={handleCopy} data-testid={`button-copy-${coupon.id}`}>
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

const skillCategories = [
  { label: "Web Development", icon: Monitor, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", count: "120+ courses" },
  { label: "Data Science", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", count: "80+ courses" },
  { label: "UI/UX Design", icon: Palette, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", count: "60+ courses" },
  { label: "DevOps & Cloud", icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30", count: "45+ courses" },
  { label: "Programming", icon: Code2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", count: "200+ courses" },
  { label: "Business", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", count: "90+ courses" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: enrolledData, isLoading: enrolledLoading } = useQuery<{ courses: Course[] }>({
    queryKey: ["/api/courses/enrolled"],
  });

  const { data: browsData, isLoading: browseLoading } = useQuery<{ courses: Course[] }>({
    queryKey: ["/api/courses"],
  });

  const { data: couponData } = useQuery<{ coupons: Coupon[] }>({
    queryKey: ["/api/coupons"],
  });

  const enrolledCourses = enrolledData?.courses ?? [];
  const allCourses = browsData?.courses ?? [];
  const enrolledIds = new Set(enrolledCourses.map(c => c.id));
  const allBrowseCourses = allCourses.filter(c => !enrolledIds.has(c.id));
  const browseCourses = activeCategory === "All"
    ? allBrowseCourses
    : allBrowseCourses.filter(c => c.category === activeCategory);
  const activeCoupons = couponData?.coupons ?? [];

  const completedCount = enrolledCourses.filter(c => (c.progress ?? 0) >= 100).length;
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress ?? 0), 0) / enrolledCourses.length)
    : 0;

  const inProgressCourse = enrolledCourses
    .filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0]
    ?? (enrolledCourses.length > 0 ? enrolledCourses[0] : null);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.userName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Pick up where you left off and keep the momentum going.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">7-day streak</span>
          <span className="text-xs text-orange-500">Keep it up!</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Enrolled", value: enrolledCourses.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completed", value: completedCount, icon: Trophy, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/40" },
          { label: "Avg Progress", value: `${totalProgress}%`, icon: Target, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
          { label: "Offers Active", value: activeCoupons.length, icon: Tag, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
        ].map(stat => (
          <Card key={stat.label} className="border-border/60" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning Hero */}
      {inProgressCourse && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Continue where you left off
          </h2>
          <ContinueLearningHero course={inProgressCourse} />
        </section>
      )}

      {/* Active Coupons */}
      {activeCoupons.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Special Offers
          </h2>
          <div className="space-y-3">
            {activeCoupons.map(coupon => (
              <CouponBanner key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      )}

      {/* My Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            My Learning
            {enrolledCourses.length > 0 && <Badge variant="secondary">{enrolledCourses.length}</Badge>}
          </h2>
        </div>

        {enrolledLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Start your learning journey</p>
                <p className="text-sm text-muted-foreground mt-1">Explore courses below and enroll to begin</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {enrolledCourses.map(course => (
              <EnrolledCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Explore Categories */}
      <section>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {skillCategories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label === activeCategory ? "All" : cat.label)}
              className={`p-3 rounded-xl border text-left transition-all hover:shadow-sm ${
                activeCategory === cat.label
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
              data-testid={`button-category-${cat.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center mb-2`}>
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-1">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Browse / Explore Courses */}
      {allBrowseCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {activeCategory === "All" ? "Recommended for You" : activeCategory}
              {activeCategory !== "All" && (
                <Badge variant="secondary">{browseCourses.length}</Badge>
              )}
            </h2>
            {activeCategory !== "All" && (
              <Button variant="ghost" size="sm" onClick={() => setActiveCategory("All")} className="text-xs gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {browseLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
            </div>
          ) : browseCourses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 flex flex-col items-center text-center gap-2">
                <p className="text-sm text-muted-foreground">No courses in this category yet.</p>
                <Button variant="ghost" size="sm" onClick={() => setActiveCategory("All")}>Browse all courses</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {browseCourses.map(course => (
                <BrowseCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Achievement Banner */}
      {completedCount > 0 && (
        <section>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                You've completed {completedCount} course{completedCount > 1 ? "s" : ""}!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Keep going — every course brings you closer to your goals.
              </p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </section>
      )}

      {/* Platform Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Learners Worldwide", value: "10K+", icon: Users },
          { label: "Expert Courses", value: "200+", icon: BookOpen },
          { label: "Hours of Content", value: "500+", icon: Clock },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
