import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle2, Tag, Play, ShoppingCart, Copy, Check, Trophy, Clock, Layers } from "lucide-react";
import { useState } from "react";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  shortDescription?: string;
  progress?: number;
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountPercent: number;
  expiresAt?: string;
}

function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-40 w-full rounded-t-lg rounded-b-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
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
    <Card className="hover-elevate overflow-visible group" data-testid={`card-enrolled-${course.id}`}>
      <div className="relative h-36 rounded-t-lg overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white gap-1 text-xs">
              <Trophy className="w-3 h-3" /> Completed
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="text-xs mb-2">{course.category}</Badge>
        <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2">{course.title}</h3>
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
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
    <Card className="hover-elevate overflow-visible group" data-testid={`card-browse-${course.id}`}>
      <div className="relative h-36 rounded-t-lg overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm">
            ₹{course.price.toLocaleString()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="text-xs mb-2">{course.category}</Badge>
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
        {course.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.shortDescription}</p>
        )}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/course/${course.id}`)}
            data-testid={`button-view-${course.id}`}
          >
            View Course
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={() => navigate(`/course/${course.id}/payment`)}
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

function CouponBanner({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5"
      data-testid={`banner-coupon-${coupon.id}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{coupon.title}</p>
          <p className="text-xs text-muted-foreground">{coupon.description || `${coupon.discountPercent}% off on all courses`}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="px-3 py-1.5 rounded-lg border border-dashed border-primary/40 bg-background">
          <span className="font-mono font-semibold text-sm text-primary">{coupon.code}</span>
        </div>
        <Button size="icon" variant="ghost" onClick={handleCopy} data-testid={`button-copy-${coupon.id}`}>
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

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
  const browseCourses = allCourses.filter(c => !enrolledIds.has(c.id));
  const activeCoupons = couponData?.coupons ?? [];

  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress ?? 0), 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome + Stats */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, {user?.userName?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground text-sm">Continue where you left off or explore new courses.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: enrolledCourses.length, icon: BookOpen, color: "text-primary" },
          { label: "Completed", value: enrolledCourses.filter(c => (c.progress ?? 0) >= 100).length, icon: CheckCircle2, color: "text-green-500" },
          { label: "Avg. Progress", value: `${totalProgress}%`, icon: Layers, color: "text-orange-500" },
          { label: "Offers Available", value: activeCoupons.length, icon: Tag, color: "text-purple-500" },
        ].map(stat => (
          <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Enrolled Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            My Courses
            {enrolledCourses.length > 0 && (
              <Badge variant="secondary">{enrolledCourses.length}</Badge>
            )}
          </h2>
        </div>
        {enrolledLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No courses yet</p>
                <p className="text-sm text-muted-foreground mt-1">Browse the available courses and start learning</p>
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

      {/* Browse Courses */}
      {browseCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Browse Courses
            </h2>
          </div>
          {browseLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {browseCourses.map(course => (
                <BrowseCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
