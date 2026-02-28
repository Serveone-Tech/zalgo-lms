import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Download, BookOpen, CheckCircle2, Star } from "lucide-react";
import { downloadCertificate } from "@/lib/certificate";
import { CertificateCard } from "@/pages/certificate-preview";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EnrolledCourse {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  progress: number;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ courses: EnrolledCourse[] }>({
    queryKey: ["/api/courses/enrolled"],
  });

  const courses = data?.courses ?? [];
  const completed = courses.filter(c => c.progress === 100);
  const inProgress = courses.filter(c => c.progress < 100);

  const handleDownload = async (courseId: string) => {
    setDownloading(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}/certificate`, { credentials: "include" });
      const certData = await res.json();
      if (!res.ok) throw new Error(certData.message);
      await downloadCertificate(certData);
      toast({ title: "Certificate downloaded!", description: "Check your downloads folder." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-6 flex flex-col gap-8">

      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-sm text-muted-foreground">Complete a course to earn your official certificate</p>
        </div>
      </div>

      {/* ── Motivational banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white p-8">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 shrink-0">
            <Award className="w-10 h-10 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Earn Your Zalgo Edutech Certificate</h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-xl">
              Every course you complete earns you an official certificate issued by <strong>Zalgo Edutech</strong>,
              signed by our directors <strong>Bhupendra Parmar</strong> and <strong>Lokendra Parmar</strong>.
              Share it on LinkedIn, add it to your resume, and showcase your skills to the world!
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { icon: CheckCircle2, label: "Digitally verified" },
                { icon: Star,         label: "Industry recognized" },
                { icon: Award,        label: "Director signed" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                  <Icon className="w-3.5 h-3.5 text-yellow-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 font-semibold"
            onClick={() => navigate("/dashboard")}
            data-testid="button-browse-courses"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* ── Earned certificates ── */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Earned Certificates ({completed.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {completed.map(course => (
              <div
                key={course.id}
                className="bg-background rounded-xl border border-green-200 dark:border-green-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                data-testid={`card-certificate-${course.id}`}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">Completed</Badge>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-sm leading-tight">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{course.category}</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleDownload(course.id)}
                    disabled={downloading === course.id}
                    data-testid={`button-download-cert-${course.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading === course.id ? "Generating…" : "Download Certificate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sample / locked certificate preview ── */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          {completed.length > 0 ? "Sample Certificate Design" : "Your Certificate Preview"}
        </h2>

        {/* Certificate preview card */}
        <div className="relative max-w-2xl">
          {/* Blurred overlay with message — shown only if no completed course */}
          {completed.length === 0 && (
            <div className="absolute inset-0 z-10 rounded-xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-background/60">
              <div className="text-center px-6">
                <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">Certificate Awaits You!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Complete any enrolled course to unlock your official Zalgo Edutech certificate,
                  personally signed by our directors.
                </p>
                <Button className="mt-4" onClick={() => navigate("/dashboard")} data-testid="button-go-to-courses">
                  Start Learning Now
                </Button>
              </div>
            </div>
          )}

          {/* Sample certificate — new design, shared component */}
          <div
            style={{
              filter: completed.length === 0 ? "blur(2px)" : "none",
              transition: "filter 0.3s",
              pointerEvents: completed.length === 0 ? "none" : "auto",
            }}
          >
            <CertificateCard
              studentName={user?.userName ?? "Student Name"}
              courseName={inProgress[0]?.title ?? completed[0]?.title ?? "Your Course Title"}
              category={inProgress[0]?.category ?? completed[0]?.category ?? "Category"}
              date={new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              certId="ZE-XXXX-XXXX-XXXXX"
            />
          </div>
        </div>
      </div>

      {/* ── In-progress courses ── */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Courses In Progress
          </h2>
          <div className="flex flex-col gap-3">
            {inProgress.map(course => (
              <div
                key={course.id}
                className="bg-background rounded-xl border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                data-testid={`card-inprogress-${course.id}`}
              >
                <img src={course.thumbnail} alt={course.title} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{course.progress}%</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${course.id}`)} data-testid={`button-continue-${course.id}`}>
                  Continue
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && courses.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No courses enrolled yet</p>
          <p className="text-sm mt-1">Enroll in a course to start earning certificates</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")} data-testid="button-enroll-now">
            Explore Courses
          </Button>
        </div>
      )}
    </div>
  );
}
