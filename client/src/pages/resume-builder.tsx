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
  Code2, Award, FileText, Eye,
} from "lucide-react";
import { downloadResume, type ResumeData } from "@/lib/resume";
import { useToast } from "@/hooks/use-toast";

const emptyEdu = () => ({ degree: "", institution: "", year: "", grade: "" });
const emptyExp = () => ({ title: "", company: "", duration: "", description: "" });
const emptyProj = () => ({ name: "", technologies: "", description: "" });
const emptyCert = () => ({ name: "", issuer: "", year: "" });

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState<ResumeData>({
    name: user?.userName ?? "",
    email: user?.email ?? "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: [],
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    certifications: [emptyCert()],
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

  const removeRow = (arr: keyof ResumeData, idx: number) =>
    setForm(f => {
      const copy = (f[arr] as any[]).filter((_, i) => i !== idx);
      return { ...f, [arr]: copy.length ? copy : [(arr === "education" ? emptyEdu() : arr === "experience" ? emptyExp() : arr === "projects" ? emptyProj() : emptyCert())] };
    });

  const addSkill = () => {
    const tags = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    if (tags.length) {
      set("skills", [...form.skills, ...tags]);
      setSkillInput("");
    }
  };

  const removeSkill = (i: number) => set("skills", form.skills.filter((_, idx) => idx !== i));

  const handleDownload = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    setDownloading(true);
    try {
      downloadResume(form);
      toast({ title: "Resume downloaded!", description: "Your PDF resume is ready." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Resume Builder</h1>
          <p className="text-xs text-muted-foreground">Fill in your details and download a professional PDF resume</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(p => !p)}
            className="gap-1.5"
            data-testid="button-toggle-preview"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            size="sm"
            className="gap-1.5"
            data-testid="button-download-resume"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 grid gap-4 p-4 ${showPreview ? "md:grid-cols-2" : "md:grid-cols-1 max-w-3xl mx-auto w-full"}`}>

        {/* ── LEFT: Form ── */}
        <div className="flex flex-col gap-4 overflow-y-auto">

          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <User className="w-4 h-4" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  data-testid="input-resume-name"
                />
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
                <Input placeholder="Mumbai, India" value={form.location} onChange={e => set("location", e.target.value)} data-testid="input-resume-location" />
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

          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" /> Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="A brief 2-3 sentence overview of your experience, key strengths, and career goals..."
                rows={4}
                value={form.summary}
                onChange={e => set("summary", e.target.value)}
                data-testid="textarea-resume-summary"
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Code2 className="w-4 h-4" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, Node.js, Python  (comma separated)"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  data-testid="input-resume-skill"
                />
                <Button type="button" size="sm" variant="outline" onClick={addSkill} data-testid="button-add-skill">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeSkill(i)} data-testid={`badge-skill-${i}`}>
                      {s} <span className="text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Press Enter or click + to add. Click a skill badge to remove it.</p>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <GraduationCap className="w-4 h-4" /> Education
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("education", emptyEdu)} className="h-7 text-xs gap-1" data-testid="button-add-education">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-3 flex flex-col gap-2 relative">
                  {form.education.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={() => removeRow("education", i)} data-testid={`button-remove-education-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1 col-span-2">
                      <Label className="text-xs">Degree / Qualification</Label>
                      <Input placeholder="B.Tech in Computer Science" value={edu.degree} onChange={e => setArrField("education", i, "degree", e.target.value)} data-testid={`input-edu-degree-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
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

          {/* Experience */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Briefcase className="w-4 h-4" /> Work Experience
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("experience", emptyExp)} className="h-7 text-xs gap-1" data-testid="button-add-experience">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="border rounded-lg p-3 flex flex-col gap-2 relative">
                  {form.experience.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={() => removeRow("experience", i)} data-testid={`button-remove-exp-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Job Title</Label>
                      <Input placeholder="Frontend Developer" value={exp.title} onChange={e => setArrField("experience", i, "title", e.target.value)} data-testid={`input-exp-title-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Company</Label>
                      <Input placeholder="Tech Corp Pvt. Ltd." value={exp.company} onChange={e => setArrField("experience", i, "company", e.target.value)} data-testid={`input-exp-company-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <Label className="text-xs">Duration</Label>
                      <Input placeholder="June 2023 – Present" value={exp.duration} onChange={e => setArrField("experience", i, "duration", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <Label className="text-xs">Key Responsibilities (one per line)</Label>
                      <Textarea
                        placeholder={"Built responsive UIs using React and Tailwind CSS\nReduced page load time by 40% through lazy loading\nCollaborated with backend team on REST API integration"}
                        rows={4}
                        value={exp.description}
                        onChange={e => setArrField("experience", i, "description", e.target.value)}
                        data-testid={`textarea-exp-desc-${i}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Code2 className="w-4 h-4" /> Projects
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("projects", emptyProj)} className="h-7 text-xs gap-1" data-testid="button-add-project">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.projects.map((proj, i) => (
                <div key={i} className="border rounded-lg p-3 flex flex-col gap-2 relative">
                  {form.projects.length > 1 && (
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-destructive" onClick={() => removeRow("projects", i)} data-testid={`button-remove-project-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Project Name</Label>
                        <Input placeholder="E-commerce App" value={proj.name} onChange={e => setArrField("projects", i, "name", e.target.value)} data-testid={`input-proj-name-${i}`} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Technologies Used</Label>
                        <Input placeholder="React, Node.js, MongoDB" value={proj.technologies} onChange={e => setArrField("projects", i, "technologies", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea placeholder="Brief description of the project, your role, and its impact..." rows={3} value={proj.description} onChange={e => setArrField("projects", i, "description", e.target.value)} data-testid={`textarea-proj-desc-${i}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Award className="w-4 h-4" /> Certifications
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => addRow("certifications", emptyCert)} className="h-7 text-xs gap-1" data-testid="button-add-cert">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {form.certifications.map((cert, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <div className="flex flex-col gap-1 col-span-3 sm:col-span-1">
                      <Label className="text-xs">Certificate Name</Label>
                      <Input placeholder="AWS Cloud Practitioner" value={cert.name} onChange={e => setArrField("certifications", i, "name", e.target.value)} data-testid={`input-cert-name-${i}`} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs">Issuer</Label>
                      <Input placeholder="Amazon" value={cert.issuer} onChange={e => setArrField("certifications", i, "issuer", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1 col-span-1">
                      <Label className="text-xs">Year</Label>
                      <Input placeholder="2024" value={cert.year} onChange={e => setArrField("certifications", i, "year", e.target.value)} />
                    </div>
                  </div>
                  {form.certifications.length > 1 && (
                    <Button size="icon" variant="ghost" className="mt-5 h-8 w-8 text-destructive" onClick={() => removeRow("certifications", i)} data-testid={`button-remove-cert-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        {showPreview && (
          <div className="hidden md:block sticky top-16 self-start">
            <div className="text-xs text-muted-foreground text-center mb-2">Live Preview</div>
            <div
              className="bg-white shadow-lg overflow-hidden relative"
              style={{ width: "100%", aspectRatio: "210/297", fontFamily: "Arial, sans-serif", fontSize: "clamp(6px, 0.85vw, 10px)" }}
            >
              {/* Header */}
              <div className="bg-[#00768F] text-white px-[5%] py-[4%]">
                <p className="font-bold leading-tight" style={{ fontSize: "2.2em" }}>{form.name || "Your Name"}</p>
                <p className="text-[#C8EEF5] mt-1 leading-relaxed" style={{ fontSize: "0.9em" }}>
                  {[form.phone, form.email, form.location, form.linkedin, form.github, form.portfolio].filter(Boolean).join("  •  ") || "Phone  •  Email  •  Location"}
                </p>
              </div>
              <div className="h-[0.5%] bg-[#C9A227]" />

              <div className="px-[5%] py-[3%] flex flex-col gap-[2.5%]">
                {/* Summary */}
                {form.summary && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>PROFESSIONAL SUMMARY</p>
                    <p className="text-gray-600 mt-1 leading-relaxed" style={{ fontSize: "0.85em" }}>{form.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {form.skills.length > 0 && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>SKILLS</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.skills.map((s, i) => (
                        <span key={i} className="bg-[#E6F8FC] text-[#00768F] px-1.5 rounded" style={{ fontSize: "0.8em" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {form.education.some(e => e.degree || e.institution) && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>EDUCATION</p>
                    {form.education.map((edu, i) => (edu.degree || edu.institution) ? (
                      <div key={i} className="mt-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-800" style={{ fontSize: "0.9em" }}>{edu.degree}</span>
                          <span className="text-gray-400" style={{ fontSize: "0.8em" }}>{edu.year}</span>
                        </div>
                        <p className="text-gray-500 italic" style={{ fontSize: "0.8em" }}>{[edu.institution, edu.grade && `CGPA: ${edu.grade}`].filter(Boolean).join(" | ")}</p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Experience */}
                {form.experience.some(e => e.title || e.company) && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>WORK EXPERIENCE</p>
                    {form.experience.map((exp, i) => (exp.title || exp.company) ? (
                      <div key={i} className="mt-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-800" style={{ fontSize: "0.9em" }}>{exp.title}</span>
                          <span className="text-gray-400" style={{ fontSize: "0.8em" }}>{exp.duration}</span>
                        </div>
                        <p className="text-[#00768F] italic" style={{ fontSize: "0.8em" }}>{exp.company}</p>
                        {exp.description && (
                          <ul className="list-disc list-inside text-gray-600 mt-0.5" style={{ fontSize: "0.8em" }}>
                            {exp.description.split("\n").filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Projects */}
                {form.projects.some(p => p.name) && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>PROJECTS</p>
                    {form.projects.map((proj, i) => proj.name ? (
                      <div key={i} className="mt-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-800" style={{ fontSize: "0.9em" }}>{proj.name}</span>
                          <span className="text-[#00768F]" style={{ fontSize: "0.75em" }}>{proj.technologies}</span>
                        </div>
                        <p className="text-gray-600" style={{ fontSize: "0.8em" }}>{proj.description}</p>
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* Certifications */}
                {form.certifications.some(c => c.name) && (
                  <div>
                    <p className="font-bold text-[#00768F] tracking-widest border-b border-[#00768F]" style={{ fontSize: "0.85em" }}>CERTIFICATIONS</p>
                    {form.certifications.map((cert, i) => cert.name ? (
                      <div key={i} className="flex justify-between mt-1">
                        <span className="text-gray-800" style={{ fontSize: "0.85em" }}>• {cert.name}</span>
                        <span className="text-gray-400" style={{ fontSize: "0.8em" }}>{[cert.issuer, cert.year].filter(Boolean).join(", ")}</span>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-[#C9A227] px-[5%] py-[1%] flex justify-between">
                <span className="text-gray-300" style={{ fontSize: "0.7em" }}>Generated by Zalgo Edutech Resume Builder</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
