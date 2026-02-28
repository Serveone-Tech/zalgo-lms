import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock,
  GraduationCap,
  ArrowLeft,
  Moon,
  Sun,
  Clock,
  Layers,
  BookOpen,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface Lecture {
  id: string;
  title: string;
  videoUrl?: string;
  duration: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lectures: Lecture[];
}

interface Course {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
  shortDescription?: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CoursePlayerPage({ courseId }: { courseId: string }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const qc = useQueryClient();
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: courseData, isLoading: courseLoading } = useQuery<{ course: Course }>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: modulesData, isLoading: modulesLoading } = useQuery<{ modules: Module[] }>({
    queryKey: [`/api/courses/${courseId}/modules`],
  });

  const { data: progressData } = useQuery<{ completed: string[] }>({
    queryKey: [`/api/courses/${courseId}/progress`],
  });

  const { data: enrollData } = useQuery<{ enrolled: boolean; enrollment?: { progress: number } }>({
    queryKey: [`/api/courses/${courseId}/enrollment`],
  });

  const course = courseData?.course;
  const modules = modulesData?.modules ?? [];
  const completed = new Set(progressData?.completed ?? []);
  const enrollment = enrollData?.enrollment;

  const allLectures = modules.flatMap(m => m.lectures);
  const totalProgress = allLectures.length > 0
    ? Math.round((completed.size / allLectures.length) * 100)
    : 0;

  useEffect(() => {
    if (modules.length > 0) {
      setExpandedModules(new Set([modules[0].id]));
      if (!activeLecture && modules[0].lectures.length > 0) {
        setActiveLecture(modules[0].lectures[0]);
      }
    }
  }, [modules.length]);

  useEffect(() => {
    if (!enrollData) return;
    if (!enrollData.enrolled) {
      navigate(`/course/${courseId}/payment`);
    }
  }, [enrollData]);

  const completeMutation = useMutation({
    mutationFn: async (lectureId: string) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/lectures/${lectureId}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/progress`] });
      qc.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
      qc.invalidateQueries({ queryKey: ["/api/courses/enrolled"] });
    },
  });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = courseLoading || modulesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 h-14">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm hidden sm:block">{course?.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalProgress > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Progress value={totalProgress} className="w-24 h-1.5" />
              <span className="text-xs text-muted-foreground">{totalProgress}%</span>
            </div>
          )}
          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Content */}
        <aside className="w-72 border-r border-border bg-background flex-shrink-0 hidden md:flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-1">Course Content</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="w-3 h-3" />
              <span>{modules.length} modules</span>
              <span>•</span>
              <span>{allLectures.length} lectures</span>
            </div>
            <div className="mt-2.5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completed.size}/{allLectures.length} completed</span>
              </div>
              <Progress value={totalProgress} className="h-1.5" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {modules.map((module) => {
                const isExpanded = expandedModules.has(module.id);
                const moduleCompleted = module.lectures.filter(l => completed.has(l.id)).length;

                return (
                  <div key={module.id} className="mb-1">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-muted/70 text-left transition-colors"
                      data-testid={`module-${module.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{module.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {moduleCompleted}/{module.lectures.length} done
                        </p>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="ml-2 pl-2 border-l border-border space-y-0.5 mb-1">
                        {module.lectures.map((lecture) => {
                          const isActive = activeLecture?.id === lecture.id;
                          const isDone = completed.has(lecture.id);

                          return (
                            <button
                              key={lecture.id}
                              onClick={() => setActiveLecture(lecture)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors text-sm",
                                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                              )}
                              data-testid={`lecture-${lecture.id}`}
                            >
                              <div className="flex-shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                ) : isActive ? (
                                  <Play className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40" />
                                )}
                              </div>
                              <span className="flex-1 truncate text-xs">{lecture.title}</span>
                              {lecture.duration > 0 && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatDuration(lecture.duration)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeLecture ? (
            <div className="max-w-4xl mx-auto p-6">
              {/* Video Player */}
              <div className="rounded-xl overflow-hidden bg-black aspect-video mb-6 shadow-lg">
                {activeLecture.videoUrl ? (
                  <iframe
                    src={activeLecture.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={activeLecture.title}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Play className="w-12 h-12 text-white/40" />
                    <p className="text-white/60 text-sm">Video coming soon</p>
                  </div>
                )}
              </div>

              {/* Lecture Info */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{activeLecture.title}</h2>
                  {activeLecture.duration > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(activeLecture.duration)}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={completed.has(activeLecture.id) ? "secondary" : "default"}
                  onClick={() => completeMutation.mutate(activeLecture.id)}
                  disabled={completeMutation.isPending}
                  className="flex-shrink-0 gap-2"
                  data-testid="button-mark-complete"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {completed.has(activeLecture.id) ? "Completed" : "Mark Complete"}
                </Button>
              </div>

              <Separator className="mb-6" />

              {/* Navigation */}
              <div className="flex justify-between gap-3">
                {(() => {
                  const idx = allLectures.findIndex(l => l.id === activeLecture.id);
                  const prev = idx > 0 ? allLectures[idx - 1] : null;
                  const next = idx < allLectures.length - 1 ? allLectures[idx + 1] : null;
                  return (
                    <>
                      <Button
                        variant="outline"
                        disabled={!prev}
                        onClick={() => prev && setActiveLecture(prev)}
                        data-testid="button-prev-lecture"
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={!next}
                        onClick={() => next && setActiveLecture(next)}
                        data-testid="button-next-lecture"
                      >
                        Next Lecture
                      </Button>
                    </>
                  );
                })()}
              </div>

              {/* Certificate Section */}
              {totalProgress >= 100 && (
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Course Completed!</h3>
                      <p className="text-sm text-muted-foreground">Congratulations on completing the course.</p>
                    </div>
                    <Badge className="bg-green-500 text-white">100%</Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Select a lecture to begin</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a lecture from the sidebar to start learning</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
