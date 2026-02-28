import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Download, BookOpen, CheckCircle2, Star } from "lucide-react";
import { downloadCertificate } from "@/lib/certificate";
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

          {/* Sample certificate HTML */}
          <div
            className="w-full rounded-xl overflow-hidden shadow-2xl border"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", backgroundColor: "#FFFCF2", filter: completed.length === 0 ? "blur(3px)" : "none", transition: "filter 0.3s" }}
          >
            {/* Top teal band */}
            <div style={{ background: "#00768F", height: 40 }} />
            <div style={{ height: 6, background: "#C9A227" }} />

            <div style={{ padding: "28px 36px" }}>
              {/* Logo + brand */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <img src="/logo.png" alt="Zalgo Edutech" style={{ height: 36, objectFit: "contain" }} />
                <p style={{ fontSize: 10, fontFamily: "Arial, sans-serif", letterSpacing: "0.3em", color: "#00768F", fontWeight: 700, marginTop: 4 }}>ZALGO EDUTECH</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6 }}>
                  <div style={{ flex: 1, height: 1, background: "#C9A227" }} />
                  <div style={{ width: 8, height: 8, background: "#C9A227", transform: "rotate(45deg)" }} />
                  <div style={{ flex: 1, height: 1, background: "#C9A227" }} />
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, fontStyle: "italic", color: "#111", margin: 0 }}>Certificate of Completion</h1>
                <div style={{ width: 120, height: 1.5, background: "#C9A227", margin: "8px auto 0" }} />
              </div>

              {/* Certify text */}
              <p style={{ textAlign: "center", fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 6 }}>This is to certify that</p>

              {/* Name */}
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                <p style={{ fontSize: 30, fontWeight: 700, color: "#00768F", margin: 0 }}>{user?.userName ?? "Student Name"}</p>
                <div style={{ height: 2.5, background: "#00A2C2", maxWidth: 280, margin: "4px auto 0" }} />
                <div style={{ height: 1, background: "#C9A227", maxWidth: 200, margin: "3px auto 0", opacity: 0.7 }} />
              </div>

              <p style={{ textAlign: "center", fontSize: 11, color: "#777", fontStyle: "italic", marginBottom: 10 }}>has successfully completed the online course</p>

              {/* Course placeholder */}
              <p style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8, fontFamily: "Arial, sans-serif" }}>
                {inProgress[0]?.title ?? "Your Course Title"}
              </p>

              {/* Category */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <span style={{ border: "1px solid #00768F", color: "#00768F", background: "#E6F8FC", fontSize: 9, fontFamily: "Arial, sans-serif", letterSpacing: "0.15em", padding: "3px 14px", fontWeight: 700 }}>
                  {inProgress[0]?.category?.toUpperCase() ?? "CATEGORY"}
                </span>
              </div>

              {/* Dividers */}
              <div style={{ height: 1.5, background: "#C9A227", marginBottom: 3 }} />
              <div style={{ height: 1, background: "#00768F", opacity: 0.2, marginBottom: 16 }} />

              {/* Bottom row: Date | Seal | CertID */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                {/* Date */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 7, fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.15em", color: "#888", marginBottom: 2 }}>DATE OF COMPLETION</p>
                  <p style={{ fontSize: 10, color: "#222" }}>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <div style={{ height: 1, background: "#C9A227", marginTop: 4 }} />
                </div>

                {/* Seal */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#00768F", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px #C9A227" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#FFFCF2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src="/logo.png" alt="ZE" style={{ width: 32, objectFit: "contain" }} />
                    </div>
                  </div>
                </div>

                {/* Cert ID */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 7, fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.15em", color: "#888", marginBottom: 2 }}>CERTIFICATE ID</p>
                  <p style={{ fontSize: 10, fontFamily: "'Courier New', monospace", color: "#222" }}>ZE-XXXX-XXXX-XXXXX</p>
                  <div style={{ height: 1, background: "#C9A227", marginTop: 4 }} />
                </div>
              </div>

              {/* ── Director signatures ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
                {/* Director 1 */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <img src="/sig_bhupendra.png" alt="Bhupendra Parmar Signature" style={{ height: 48, objectFit: "contain", marginBottom: 4, filter: "contrast(1.3)" }} />
                  <div style={{ height: 1, background: "#555", marginBottom: 4 }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#111", margin: 0 }}>Bhupendra Parmar</p>
                  <p style={{ fontSize: 9, color: "#888", fontFamily: "Arial, sans-serif", marginTop: 1 }}>Director, Zalgo Edutech</p>
                </div>

                {/* Center gap (where seal is) */}
                <div style={{ width: 64 }} />

                {/* Director 2 */}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <img src="/sig_lokendra.png" alt="Lokendra Parmar Signature" style={{ height: 48, objectFit: "contain", marginBottom: 4, filter: "contrast(1.3)" }} />
                  <div style={{ height: 1, background: "#555", marginBottom: 4 }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#111", margin: 0 }}>Lokendra Parmar</p>
                  <p style={{ fontSize: 9, color: "#888", fontFamily: "Arial, sans-serif", marginTop: 1 }}>Director, Zalgo Edutech</p>
                </div>
              </div>
            </div>

            {/* Bottom teal band */}
            <div style={{ height: 6, background: "#C9A227" }} />
            <div style={{ background: "#00768F", padding: "6px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontFamily: "Arial, sans-serif", margin: 0 }}>
                Zalgo Edutech  •  This certificate is issued digitally and is valid without a physical signature.
              </p>
            </div>
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
