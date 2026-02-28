import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download, Plus, Trash2, User, Mail, Phone, MapPin,
  Linkedin, Github, Globe, Briefcase, GraduationCap,
  Code2, Award, FileText, Eye, Palette,
} from "lucide-react";
import { downloadResume, type ResumeData } from "@/lib/resume";
import { useToast } from "@/hooks/use-toast";

const ACCENT_COLORS = [
  { label: "Teal",     hex: "#00768F" },
  { label: "Navy",     hex: "#1B3A6B" },
  { label: "Maroon",   hex: "#8B1A1A" },
  { label: "Forest",   hex: "#1A6B3C" },
  { label: "Purple",   hex: "#5C2D91" },
  { label: "Slate",    hex: "#2D4A5C" },
  { label: "Charcoal", hex: "#2C2C2C" },
  { label: "Burnt",    hex: "#A0522D" },
];

const FONT_OPTIONS: { label: string; sub: string; value: ResumeData["fontStyle"] }[] = [
  { label: "Modern",  sub: "Clean & crisp",   value: "helvetica" },
  { label: "Classic", sub: "Elegant serif",   value: "times"     },
  { label: "Tech",    sub: "Monospace style", value: "courier"   },
];

const FONT_PREVIEW: Record<ResumeData["fontStyle"], string> = {
  helvetica: "Arial, sans-serif",
  times:     "'Times New Roman', serif",
  courier:   "'Courier New', monospace",
};

const emptyEdu  = () => ({ degree: "", institution: "", year: "", grade: "" });
const emptyExp  = () => ({ title: "", company: "", duration: "", description: "" });
const emptyProj = () => ({ name: "", technologies: "", description: "" });
const emptyCert = () => ({ name: "", issuer: "", year: "" });

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState<ResumeData>({
    name:        user?.userName ?? "",
    email:       user?.email ?? "",
    phone:       "",
    location:    "",
    linkedin:    "",
    github:      "",
    portfolio:   "",
    summary:     "",
    skills:      [],
    education:   [emptyEdu()],
    experience:  [emptyExp()],
    projects:    [emptyProj()],
    certifications: [emptyCert()],
    accentColor: "#00768F",
    fontStyle:   "helvetica",
  });

  const [skillInput, setSkillInput] = useState("");

  const set = (key: keyof ResumeData, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const setArrField = (arr: keyof ResumeData, idx: number, field: string, value: string) =>
    setForm(f => {
      const copy = [...(f[arr] as any[])];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...f, [arr]: copy };
    });

  const addRow = (arr: keyof ResumeData, empty: () => object) =>
    setForm(f => ({ ...f, [arr]: [...(f[arr] as any[]), empty()] }));

  const removeRow = (arr: keyof ResumeData, idx: number) => {
    const fallbacks: Record<string, () => object> = {
      education: emptyEdu, experience: emptyExp, projects: emptyProj, certifications: emptyCert,
    };
    setForm(f => {
      const copy = (f[arr] as any[]).filter((_, i) => i !== idx);
      return { ...f, [arr]: copy.length ? copy : [fallbacks[arr as string]()] };
    });
  };

  const addSkill = () => {
    const tags = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    if (tags.length) { set("skills", [...form.skills, ...tags]); setSkillInput(""); }
  };

  const removeSkill = (i: number) => set("skills", form.skills.filter((_, idx) => idx !== i));

  const handleDownload = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setDownloading(true);
    try {
      downloadResume(form);
      toast({ title: "Resume downloaded!", description: "Your PDF resume is ready." });
    } finally { setDownloading(false); }
  };

  const accent = form.accentColor;
  const fontFamily = FONT_PREVIEW[form.fontStyle];

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* ── Top bar ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background border-b px-5 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-bold">Resume Builder</h1>
          <p className="text-xs text-muted-foreground">Fill in details → Preview → Download PDF</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(p => !p)} className="gap-1.5" data-testid="button-toggle-preview">
            <Eye className="w-3.5 h-3.5" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-1.5" data-testid="button-download-resume">
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className={`flex-1 grid gap-5 p-5 ${showPreview ? "lg:grid-cols-[1fr_420px]" : "lg:grid-cols-1 max-w-3xl mx-auto w-full"}`}>

        {/* ═══════════ LEFT: Form ═══════════ */}
        <div className="flex flex-col gap-4">

          {/* ── Customization ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Palette className="w-4 h-4" /> Customize Style
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Color swatches */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Accent Color</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {ACCENT_COLORS.map(({ label, hex }) => (
                    <button
                      key={hex}
                      title={label}
                      onClick={() => set("accentColor", hex)}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: hex,
                        borderColor: form.accentColor === hex ? "#fff" : "transparent",
                        boxShadow: form.accentColor === hex ? `0 0 0 2px ${hex}` : "none",
                      }}
                      data-testid={`color-swatch-${label.toLowerCase()}`}
                    />
                  ))}
                  {/* Custom color picker */}
                  <div className="relative" title="Custom color">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={e => set("accentColor", e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      data-testid="input-custom-color"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center text-xs font-bold text-white select-none"
                      style={{ backgroundColor: form.accentColor }}
                    >+</div>
                  </div>
                </div>
              </div>

              {/* Font selector */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Font Style</Label>
                <div className="flex gap-2">
                  {FONT_OPTIONS.map(({ label, sub, value }) => (
                    <button
                      key={value}
                      onClick={() => set("fontStyle", value)}
                      className={`flex-1 border rounded-lg px-3 py-2 text-left transition-all ${
                        form.fontStyle === value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:bg-muted"
                      }`}
                      data-testid={`font-option-${value}`}
                    >
                      <p className="text-sm font-semibold" style={{ fontFamily: FONT_PREVIEW[value] }}>{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Personal Info ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <User className="w-4 h-4" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-xs">Full Name *</Label>
                <Input placeholder="Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)} data-testid="input-resume-name" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><Mail className="inline w-3 h-3 mr-1" />Email</Label>
                <Input placeholder="rahul@example.com" value={form.email} onChange={e => set("email", e.target.value)} data-testid="input-resume-email" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><Phone className="inline w-3 h-3 mr-1" />Phone</Label>
                <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} data-testid="input-resume-phone" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><MapPin className="inline w-3 h-3 mr-1" />Location</Label>
                <Input placeholder="Mumbai, India" value={form.location} onChange={e => set("location", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><Linkedin className="inline w-3 h-3 mr-1" />LinkedIn</Label>
                <Input placeholder="linkedin.com/in/rahul" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><Github className="inline w-3 h-3 mr-1" />GitHub</Label>
                <Input placeholder="github.com/rahul" value={form.github} onChange={e => set("github", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs"><Globe className="inline w-3 h-3 mr-1" />Portfolio</Label>
                <Input placeholder="rahul.dev" value={form.portfolio} onChange={e => set("portfolio", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* ── Summary ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><FileText className="w-4 h-4" /> Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="A brief 2-3 sentence overview of your strengths and career goals..." rows={4} value={form.summary} onChange={e => set("summary", e.target.value)} data-testid="textarea-resume-summary" />
            </CardContent>
          </Card>

          {/* ── Skills ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><Code2 className="w-4 h-4" /> Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input placeholder="e.g. React, Node.js, Python  (comma separated)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} data-testid="input-resume-skill" />
                <Button type="button" size="sm" variant="outline" onClick={addSkill} data-testid="button-add-skill"><Plus className="w-4 h-4" /></Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeSkill(i)} data-testid={`badge-skill-${i}`}>
                      {s} <span className="opacity-60">×</span>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Press Enter or comma to add. Click badge to remove.</p>
            </CardContent>
          </Card>

          {/* ── Education ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><GraduationCap className="w-4 h-4" /> Education</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("education", emptyEdu)} className="h-7 text-xs gap-1" data-testid="button-add-education"><Plus className="w-3 h-3" /> Add</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-4 flex flex-col gap-3 relative bg-muted/30">
                  {form.education.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeRow("education", i)} data-testid={`button-remove-education-${i}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-xs">Degree / Qualification</Label>
                      <Input placeholder="B.Tech in Computer Science" value={edu.degree} onChange={e => setArrField("education", i, "degree", e.target.value)} data-testid={`input-edu-degree-${i}`} />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-xs">Institution</Label>
                      <Input placeholder="IIT Bombay" value={edu.institution} onChange={e => setArrField("education", i, "institution", e.target.value)} data-testid={`input-edu-institution-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Year</Label>
                      <Input placeholder="2021 – 2025" value={edu.year} onChange={e => setArrField("education", i, "year", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">CGPA / Grade</Label>
                      <Input placeholder="8.5 / 10" value={edu.grade} onChange={e => setArrField("education", i, "grade", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Experience ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><Briefcase className="w-4 h-4" /> Work Experience</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("experience", emptyExp)} className="h-7 text-xs gap-1" data-testid="button-add-experience"><Plus className="w-3 h-3" /> Add</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="border rounded-lg p-4 flex flex-col gap-3 relative bg-muted/30">
                  {form.experience.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeRow("experience", i)} data-testid={`button-remove-exp-${i}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Job Title</Label>
                      <Input placeholder="Frontend Developer" value={exp.title} onChange={e => setArrField("experience", i, "title", e.target.value)} data-testid={`input-exp-title-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Company</Label>
                      <Input placeholder="Tech Corp Pvt. Ltd." value={exp.company} onChange={e => setArrField("experience", i, "company", e.target.value)} data-testid={`input-exp-company-${i}`} />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-xs">Duration</Label>
                      <Input placeholder="June 2023 – Present" value={exp.duration} onChange={e => setArrField("experience", i, "duration", e.target.value)} />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-xs">Key Responsibilities <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                      <Textarea placeholder={"Built responsive UIs with React\nReduced load time by 40%\nCollaborated on REST API design"} rows={5} value={exp.description} onChange={e => setArrField("experience", i, "description", e.target.value)} data-testid={`textarea-exp-desc-${i}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Projects ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><Code2 className="w-4 h-4" /> Projects</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("projects", emptyProj)} className="h-7 text-xs gap-1" data-testid="button-add-project"><Plus className="w-3 h-3" /> Add</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.projects.map((proj, i) => (
                <div key={i} className="border rounded-lg p-4 flex flex-col gap-3 relative bg-muted/30">
                  {form.projects.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeRow("projects", i)} data-testid={`button-remove-project-${i}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Project Name</Label>
                      <Input placeholder="E-commerce App" value={proj.name} onChange={e => setArrField("projects", i, "name", e.target.value)} data-testid={`input-proj-name-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Technologies Used</Label>
                      <Input placeholder="React, Node.js, MongoDB" value={proj.technologies} onChange={e => setArrField("projects", i, "technologies", e.target.value)} />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea placeholder="Brief description, your role, and impact..." rows={3} value={proj.description} onChange={e => setArrField("projects", i, "description", e.target.value)} data-testid={`textarea-proj-desc-${i}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Certifications ── */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary"><Award className="w-4 h-4" /> Certifications</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("certifications", emptyCert)} className="h-7 text-xs gap-1" data-testid="button-add-cert"><Plus className="w-3 h-3" /> Add</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {form.certifications.map((cert, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <div className="flex flex-col gap-1 col-span-3 sm:col-span-1">
                      <Label className="text-xs">Certificate Name</Label>
                      <Input placeholder="AWS Cloud Practitioner" value={cert.name} onChange={e => setArrField("certifications", i, "name", e.target.value)} data-testid={`input-cert-name-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs">Issuer</Label>
                      <Input placeholder="Amazon" value={cert.issuer} onChange={e => setArrField("certifications", i, "issuer", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Year</Label>
                      <Input placeholder="2024" value={cert.year} onChange={e => setArrField("certifications", i, "year", e.target.value)} />
                    </div>
                  </div>
                  {form.certifications.length > 1 && (
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive mb-0.5" onClick={() => removeRow("certifications", i)} data-testid={`button-remove-cert-${i}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════ RIGHT: Live Preview ═══════════ */}
        {showPreview && (
          <div className="hidden lg:flex flex-col gap-2 sticky top-[72px] self-start max-h-[calc(100vh-90px)] overflow-y-auto">
            <p className="text-xs text-center text-muted-foreground">Live Preview</p>

            {/* A4 portrait preview */}
            <div
              className="bg-white shadow-2xl rounded-sm overflow-hidden w-full relative"
              style={{ fontFamily, color: "#222" }}
            >
              {/* Header */}
              <div style={{ backgroundColor: accent, padding: "28px 28px 20px" }}>
                <p className="font-bold text-white" style={{ fontSize: 28, lineHeight: 1.15, fontFamily }}>{form.name || "Your Name"}</p>

                {/* Row 1: phone • email • location */}
                {(form.phone || form.email || form.location) && (
                  <p className="mt-2" style={{ fontSize: 12, color: "rgba(220,240,248,0.95)", fontFamily }}>
                    {[form.phone, form.email, form.location].filter(Boolean).join("   •   ")}
                  </p>
                )}
                {/* Row 2: linkedin • github • portfolio */}
                {(form.linkedin || form.github || form.portfolio) && (
                  <p className="mt-1" style={{ fontSize: 11, color: "rgba(200,230,242,0.85)", fontFamily }}>
                    {[form.linkedin, form.github, form.portfolio].filter(Boolean).join("   •   ")}
                  </p>
                )}
              </div>

              {/* Gold strip */}
              <div style={{ height: 4, backgroundColor: "#C9A227" }} />

              {/* Body */}
              <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Summary */}
                {form.summary && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>PROFESSIONAL SUMMARY</p>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#444", fontFamily }}>{form.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {form.skills.filter(Boolean).length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>SKILLS</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {form.skills.filter(Boolean).map((s, i) => (
                        <span key={i} style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}40`, borderRadius: 4, padding: "2px 10px", fontSize: 12, fontFamily }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {form.education.some(e => e.degree || e.institution) && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>EDUCATION</p>
                    {form.education.map((edu, i) => (edu.degree || edu.institution) ? (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111", fontFamily }}>{edu.degree}</span>
                          <span style={{ fontSize: 11, color: "#999", fontFamily }}>{edu.year}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 2, fontFamily }}>
                          {[edu.institution, edu.grade && `CGPA: ${edu.grade}`].filter(Boolean).join("  |  ")}
                        </p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Experience */}
                {form.experience.some(e => e.title || e.company) && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>WORK EXPERIENCE</p>
                    {form.experience.map((exp, i) => (exp.title || exp.company) ? (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111", fontFamily }}>{exp.title}</span>
                          <span style={{ fontSize: 11, color: "#999", fontFamily }}>{exp.duration}</span>
                        </div>
                        <p style={{ fontSize: 12, color: accent, fontStyle: "italic", marginTop: 2, fontFamily }}>{exp.company}</p>
                        {exp.description && (
                          <ul style={{ marginTop: 6, paddingLeft: 14, fontSize: 12, color: "#555", lineHeight: 1.7 }}>
                            {exp.description.split("\n").filter(Boolean).map((b, j) => (
                              <li key={j} style={{ listStyleType: "disc", fontFamily }}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Projects */}
                {form.projects.some(p => p.name) && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>PROJECTS</p>
                    {form.projects.map((proj, i) => proj.name ? (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111", fontFamily }}>{proj.name}</span>
                          <span style={{ fontSize: 11, color: accent, fontFamily }}>{proj.technologies}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#555", marginTop: 3, lineHeight: 1.6, fontFamily }}>{proj.description}</p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Certifications */}
                {form.certifications.some(c => c.name) && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", borderBottom: `1.5px solid ${accent}`, paddingBottom: 2, marginBottom: 7, fontFamily }}>CERTIFICATIONS</p>
                    {form.certifications.map((cert, i) => cert.name ? (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#222", fontFamily }}>• {cert.name}</span>
                        <span style={{ fontSize: 11, color: "#999", fontFamily }}>{[cert.issuer, cert.year].filter(Boolean).join(", ")}</span>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ borderTop: "1px solid #C9A227", padding: "8px 28px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "#ccc", fontFamily }}>Generated by Zalgo Edutech Resume Builder</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
