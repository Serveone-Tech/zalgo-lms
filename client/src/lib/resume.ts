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
  accentColor: string;
  fontStyle: "helvetica" | "times" | "courier";
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lighten(hex: string, amount = 0.88): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  ];
}

function sectionHeading(
  doc: jsPDF, text: string, y: number, W: number, ML: number,
  accent: [number, number, number], font: string
): number {
  doc.setFontSize(10.5);
  doc.setFont(font, "bold");
  doc.setTextColor(...accent);
  doc.setCharSpace(1.5);
  doc.text(text.toUpperCase(), ML, y);
  doc.setCharSpace(0);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(ML, y + 1.5, W - ML, y + 1.5);
  return y + 7;
}

function bulletLine(doc: jsPDF, text: string, x: number, y: number, maxW: number, accent: [number, number, number], font: string): number {
  doc.setFillColor(...accent);
  doc.circle(x + 1.8, y - 1.5, 0.9, "F");
  doc.setFont(font, "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const lines = doc.splitTextToSize(text, maxW - 6);
  doc.text(lines, x + 5, y);
  return y + lines.length * 5;
}

export function downloadResume(data: ResumeData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const ML = 16;
  const MR = 16;
  const CW = W - ML - MR;
  const accent = hexToRgb(data.accentColor || "#00768F");
  const accentLight = lighten(data.accentColor || "#00768F");
  const font = data.fontStyle || "helvetica";
  let y = 0;

  // ── Header band ───────────────────────────────────────────────
  const headerH = 48;
  doc.setFillColor(...accent);
  doc.rect(0, 0, W, headerH, "F");

  // Gold accent strip
  doc.setFillColor(201, 162, 39);
  doc.rect(0, headerH, W, 1.5, "F");

  // Name
  doc.setFont(font, "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(data.name || "Your Name", ML, 18);

  // Contact line 1: phone, email, location
  const row1 = [data.phone, data.email, data.location].filter(Boolean);
  // Contact line 2: linkedin, github, portfolio
  const row2 = [data.linkedin, data.github, data.portfolio].filter(Boolean);

  doc.setFont(font, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(220, 240, 248);

  if (row1.length) {
    doc.text(row1.join("   •   "), ML, 27);
  }
  if (row2.length) {
    doc.text(row2.join("   •   "), ML, row1.length ? 34 : 27);
  }

  y = headerH + 10;

  // ── Summary ──────────────────────────────────────────────────
  if (data.summary.trim()) {
    y = sectionHeading(doc, "Professional Summary", y, W, ML, accent, font);
    doc.setFont(font, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(data.summary, CW);
    doc.text(lines, ML, y);
    y += lines.length * 5.2 + 6;
  }

  // ── Skills ───────────────────────────────────────────────────
  if (data.skills.filter(Boolean).length > 0) {
    y = sectionHeading(doc, "Skills", y, W, ML, accent, font);
    const skillCols = 3;
    const colW = CW / skillCols;
    const validSkills = data.skills.filter(Boolean);
    validSkills.forEach((skill, i) => {
      const col = i % skillCols;
      const row = Math.floor(i / skillCols);
      const sx = ML + col * colW;
      const sy = y + row * 6.5;
      doc.setFillColor(...accent);
      doc.circle(sx + 1.8, sy - 1.5, 0.9, "F");
      doc.setFont(font, "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      doc.text(skill.trim(), sx + 5, sy);
    });
    y += Math.ceil(validSkills.length / skillCols) * 6.5 + 5;
  }

  // ── Education ────────────────────────────────────────────────
  const validEdu = data.education.filter(e => e.institution || e.degree);
  if (validEdu.length) {
    y = sectionHeading(doc, "Education", y, W, ML, accent, font);
    validEdu.forEach((edu) => {
      doc.setFont(font, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(20, 20, 20);
      doc.text(edu.degree || "Degree", ML, y);
      if (edu.year) {
        doc.setFont(font, "normal");
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text(edu.year, W - MR, y, { align: "right" });
      }
      y += 5.5;
      doc.setFont(font, "italic");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const sub = [edu.institution, edu.grade ? `CGPA: ${edu.grade}` : ""].filter(Boolean).join("  |  ");
      doc.text(sub, ML, y);
      y += 7;
    });
  }

  // ── Experience ───────────────────────────────────────────────
  const validExp = data.experience.filter(e => e.company || e.title);
  if (validExp.length) {
    if (y > H - 60) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Work Experience", y, W, ML, accent, font);
    validExp.forEach((exp) => {
      doc.setFont(font, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(20, 20, 20);
      doc.text(exp.title || "Role", ML, y);
      if (exp.duration) {
        doc.setFont(font, "normal");
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text(exp.duration, W - MR, y, { align: "right" });
      }
      y += 5.5;
      doc.setFont(font, "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(...accent);
      doc.text(exp.company || "", ML, y);
      y += 5.5;
      if (exp.description.trim()) {
        const bullets = exp.description.split("\n").filter(b => b.trim());
        bullets.forEach((b) => {
          if (y > H - 25) { doc.addPage(); y = 20; }
          y = bulletLine(doc, b.trim(), ML + 2, y, CW - 2, accent, font);
          y += 1;
        });
      }
      y += 5;
    });
  }

  // ── Projects ─────────────────────────────────────────────────
  const validProj = data.projects.filter(p => p.name);
  if (validProj.length) {
    if (y > H - 60) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Projects", y, W, ML, accent, font);
    validProj.forEach((proj) => {
      doc.setFont(font, "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(20, 20, 20);
      doc.text(proj.name, ML, y);
      if (proj.technologies) {
        doc.setFont(font, "normal");
        doc.setFontSize(8);
        doc.setTextColor(...accent);
        doc.text(`[ ${proj.technologies} ]`, W - MR, y, { align: "right" });
      }
      y += 5.5;
      if (proj.description.trim()) {
        doc.setFont(font, "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(70, 70, 70);
        const lines = doc.splitTextToSize(proj.description, CW);
        doc.text(lines, ML, y);
        y += lines.length * 5.2;
      }
      y += 5;
    });
  }

  // ── Certifications ───────────────────────────────────────────
  const validCerts = data.certifications.filter(c => c.name);
  if (validCerts.length) {
    if (y > H - 40) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "Certifications", y, W, ML, accent, font);
    validCerts.forEach((cert) => {
      doc.setFillColor(...accent);
      doc.circle(ML + 1.8, y - 1.5, 0.9, "F");
      doc.setFont(font, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(cert.name, ML + 5, y);
      const right = [cert.issuer, cert.year].filter(Boolean).join(", ");
      if (right) {
        doc.setFont(font, "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(130, 130, 130);
        doc.text(right, W - MR, y, { align: "right" });
      }
      y += 6.5;
    });
  }

  // ── Footer ───────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(201, 162, 39);
    doc.setLineWidth(0.4);
    doc.line(ML, H - 13, W - MR, H - 13);
    doc.setFont(font, "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("Generated by Zalgo Edutech Resume Builder", ML, H - 9);
    doc.text(`Page ${p} / ${pages}`, W - MR, H - 9, { align: "right" });
  }

  const safeName = (data.name || "Resume").replace(/\s+/g, "_");
  doc.save(`${safeName}_Resume.pdf`);
}
