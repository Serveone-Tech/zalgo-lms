import { jsPDF } from "jspdf";

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string[];
  education: { degree: string; institution: string; year: string; grade: string }[];
  experience: { title: string; company: string; duration: string; description: string }[];
  projects: { name: string; technologies: string; description: string }[];
  certifications: { name: string; issuer: string; year: string }[];
}

const TEAL = [0, 118, 143] as [number, number, number];
const DARK = [20, 20, 20] as [number, number, number];
const GRAY = [90, 90, 90] as [number, number, number];
const LIGHT = [140, 140, 140] as [number, number, number];

function sectionHeading(doc: jsPDF, text: string, y: number, W: number, ML: number): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text(text.toUpperCase(), ML, y);
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.6);
  doc.line(ML, y + 1.5, W - ML, y + 1.5);
  return y + 7;
}

function bullet(doc: jsPDF, text: string, x: number, y: number, maxW: number): number {
  doc.setFillColor(...GRAY);
  doc.circle(x + 1.5, y - 1.2, 0.8, "F");
  const lines = doc.splitTextToSize(text, maxW - 5);
  doc.text(lines, x + 4, y);
  return y + lines.length * 4.5;
}

export function downloadResume(data: ResumeData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const ML = 15;
  const MR = 15;
  const CW = W - ML - MR;
  let y = 0;

  // ── Header band ──────────────────────────────────────────────────
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, W, 40, "F");

  // Accent strip at bottom of header
  doc.setFillColor(201, 162, 39);
  doc.rect(0, 40, W, 1.5, "F");

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(data.name || "Your Name", ML, 18);

  // Contact line
  const contactParts: string[] = [];
  if (data.phone) contactParts.push(data.phone);
  if (data.email) contactParts.push(data.email);
  if (data.location) contactParts.push(data.location);
  if (data.linkedin) contactParts.push(data.linkedin);
  if (data.github) contactParts.push(data.github);
  if (data.portfolio) contactParts.push(data.portfolio);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 240, 245);
  doc.text(contactParts.join("  •  "), ML, 27);

  y = 50;

  // ── Summary ───────────────────────────────────────────────────────
  if (data.summary.trim()) {
    y = sectionHeading(doc, "Professional Summary", y, W, ML);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    const summaryLines = doc.splitTextToSize(data.summary, CW);
    doc.text(summaryLines, ML, y);
    y += summaryLines.length * 4.5 + 5;
  }

  // ── Skills ─────────────────────────────────────────────────────────
  if (data.skills.length > 0) {
    y = sectionHeading(doc, "Skills", y, W, ML);
    const skillCols = 3;
    const colW = CW / skillCols;
    data.skills.forEach((skill, i) => {
      if (!skill.trim()) return;
      const col = i % skillCols;
      const row = Math.floor(i / skillCols);
      const sx = ML + col * colW;
      const sy = y + row * 6;
      doc.setFillColor(...TEAL);
      doc.circle(sx + 1.5, sy - 1.2, 0.8, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(skill.trim(), sx + 4, sy);
    });
    y += Math.ceil(data.skills.length / skillCols) * 6 + 4;
  }

  // ── Education ─────────────────────────────────────────────────────
  if (data.education.some(e => e.institution || e.degree)) {
    y = sectionHeading(doc, "Education", y, W, ML);
    data.education.forEach((edu) => {
      if (!edu.institution && !edu.degree) return;
      // Degree + Year on same line
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(edu.degree || "Degree", ML, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...LIGHT);
      doc.text(edu.year || "", W - MR, y, { align: "right" });
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      const sub = [edu.institution, edu.grade ? `CGPA/Grade: ${edu.grade}` : ""].filter(Boolean).join("  |  ");
      doc.text(sub, ML, y);
      y += 7;
    });
  }

  // ── Experience ─────────────────────────────────────────────────────
  if (data.experience.some(e => e.company || e.title)) {
    // Check page space
    if (y > H - 60) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Work Experience", y, W, ML);
    data.experience.forEach((exp) => {
      if (!exp.company && !exp.title) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(exp.title || "Role", ML, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...LIGHT);
      doc.text(exp.duration || "", W - MR, y, { align: "right" });
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...TEAL);
      doc.text(exp.company || "", ML, y);
      y += 5;
      if (exp.description.trim()) {
        doc.setTextColor(...GRAY);
        doc.setFont("helvetica", "normal");
        const bullets = exp.description.split("\n").filter(b => b.trim());
        bullets.forEach((b) => {
          if (y > H - 25) { doc.addPage(); y = 20; }
          y = bullet(doc, b.trim(), ML + 2, y, CW - 2);
        });
      }
      y += 4;
    });
  }

  // ── Projects ───────────────────────────────────────────────────────
  if (data.projects.some(p => p.name)) {
    if (y > H - 60) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Projects", y, W, ML);
    data.projects.forEach((proj) => {
      if (!proj.name) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(proj.name, ML, y);
      if (proj.technologies) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...TEAL);
        doc.text(`[${proj.technologies}]`, W - MR, y, { align: "right" });
      }
      y += 5;
      if (proj.description.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        const lines = doc.splitTextToSize(proj.description, CW);
        doc.text(lines, ML, y);
        y += lines.length * 4.5;
      }
      y += 4;
    });
  }

  // ── Certifications ──────────────────────────────────────────────────
  if (data.certifications.some(c => c.name)) {
    if (y > H - 40) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Certifications", y, W, ML);
    data.certifications.forEach((cert) => {
      if (!cert.name) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(cert.name, ML + 4, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...LIGHT);
      const right = [cert.issuer, cert.year].filter(Boolean).join(", ");
      doc.text(right, W - MR, y, { align: "right" });
      doc.setFillColor(...TEAL);
      doc.circle(ML + 1.5, y - 1.2, 0.8, "F");
      y += 6;
    });
  }

  // ── Footer line ──────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(201, 162, 39);
    doc.setLineWidth(0.5);
    doc.line(ML, H - 12, W - MR, H - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT);
    doc.text("Generated by Zalgo Edutech Resume Builder", ML, H - 8);
    doc.text(`Page ${p} of ${pages}`, W - MR, H - 8, { align: "right" });
  }

  const safeName = (data.name || "Resume").replace(/\s+/g, "_");
  doc.save(`${safeName}_Resume.pdf`);
}
