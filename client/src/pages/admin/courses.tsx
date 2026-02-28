import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, Plus, Pencil, Layers, Globe, EyeOff, BarChart3, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  isPublished: boolean;
  shortDescription?: string;
}

interface AdminStats {
  totalCourses: number;
  publishedCourses: number;
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  activeCoupons: number;
}

function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-40 w-full rounded-t-lg rounded-b-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCoursesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [publishTarget, setPublishTarget] = useState<Course | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const { data, isLoading } = useQuery<{ courses: Course[] }>({
    queryKey: ["/api/courses/admin"],
  });

  const { data: statsData } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const courses = data?.courses ?? [];
  const stats = statsData;

  const handlePublishToggle = async () => {
    if (!publishTarget) return;
    setPublishLoading(true);
    try {
      const res = await apiRequest("PATCH", `/api/courses/${publishTarget.id}`, {
        isPublished: !publishTarget.isPublished,
      });
      if (!res.ok) throw new Error("Failed to update");
      await qc.invalidateQueries({ queryKey: ["/api/courses/admin"] });
      await qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: publishTarget.isPublished ? "Course unpublished" : "Course published",
        description: publishTarget.isPublished
          ? "The course is now hidden from students."
          : "The course is now visible to students.",
      });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setPublishLoading(false);
      setPublishTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your course content</p>
        </div>
        <Button onClick={() => navigate("/admin/courses/new")} className="gap-2 self-start sm:self-auto" data-testid="button-add-course">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-primary" },
            { label: "Published", value: stats.publishedCourses, icon: Globe, color: "text-green-500" },
            { label: "Total Students", value: stats.totalUsers, icon: BarChart3, color: "text-blue-500" },
            { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: BarChart3, color: "text-orange-500" },
          ].map(s => (
            <Card key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No courses yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first course to get started</p>
            </div>
            <Button onClick={() => navigate("/admin/courses/new")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-visible hover-elevate" data-testid={`card-course-${course.id}`}>
              <div className="relative h-40 rounded-t-lg overflow-hidden bg-muted">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="w-10 h-10 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={course.isPublished ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">₹{course.price.toLocaleString()}</span>
                </div>
                <Separator className="mb-3" />
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => navigate(`/admin/courses/${course.id}/lectures`)}
                    data-testid={`button-lectures-${course.id}`}
                  >
                    <Layers className="w-3 h-3" />
                    Lectures
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                    data-testid={`button-edit-${course.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`flex-1 gap-1.5 text-xs ${course.isPublished ? "text-destructive hover:text-destructive" : "text-primary hover:text-primary"}`}
                    onClick={() => setPublishTarget(course)}
                    data-testid={`button-publish-${course.id}`}
                  >
                    {course.isPublished ? <EyeOff className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={!!publishTarget} onOpenChange={open => !open && setPublishTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {publishTarget?.isPublished ? "Unpublish Course?" : "Publish Course?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {publishTarget?.isPublished
                ? `"${publishTarget?.title}" will be hidden from students and no longer accessible.`
                : `"${publishTarget?.title}" will become visible to all students.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishToggle} disabled={publishLoading}>
              {publishLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (publishTarget?.isPublished ? "Unpublish" : "Publish")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
