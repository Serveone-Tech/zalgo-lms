import { jsPDF } from "jspdf";

export interface CertificateData {
  studentName: string;
  courseName: string;
  category: string;
  completedAt: string;
  certId: string;
}

async function loadBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function downloadCertificate(data: CertificateData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const W = 297;
  const H = 210;

  // ─── Background ───────────────────────────────────────────────
  doc.setFillColor(255, 252, 242);
  doc.rect(0, 0, W, H, "F");

  // Subtle teal top & bottom accent bands
  doc.setFillColor(0, 118, 143);
  doc.rect(0, 0, W, 10, "F");
  doc.rect(0, H - 10, W, 10, "F");

  // Gold strip inside bands
  doc.setFillColor(201, 162, 39);
  doc.rect(0, 10, W, 2, "F");
  doc.rect(0, H - 12, W, 2, "F");

  // ─── Outer frame ──────────────────────────────────────────────
  // Outer teal rect
  doc.setDrawColor(0, 118, 143);
  doc.setLineWidth(2);
  doc.rect(14, 16, W - 28, H - 32);

  // Inner gold rect
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.7);
  doc.rect(17, 19, W - 34, H - 38);

  // ─── Corner ornaments (gold L-brackets) ───────────────────────
  const gold = [201, 162, 39] as const;
  const teal = [0, 118, 143] as const;
  const cs = 10; // corner size
  const ci = 14; // corner inset
  const corners: [number, number, number, number][] = [
    [ci, ci, 1, 1],
    [W - ci - cs, ci, -1, 1],
    [ci, H - ci - cs, 1, -1],
    [W - ci - cs, H - ci - cs, -1, -1],
  ];
  corners.forEach(([x, y, sx, sy]) => {
    // Filled teal square
    doc.setFillColor(...teal);
    doc.rect(x, y, cs, cs, "F");
    // Gold overlay L-bracket
    doc.setFillColor(...gold);
    doc.rect(x + (sx > 0 ? 0 : cs - 2.5), y, 2.5, cs, "F");
    doc.rect(x, y + (sy > 0 ? 0 : cs - 2.5), cs, 2.5, "F");
  });

  // ─── Watermark text ───────────────────────────────────────────
  doc.setTextColor(230, 220, 200);
  doc.setFontSize(72);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE", W / 2, H / 2 + 10, { align: "center", angle: 0 });

  // ─── Logo ─────────────────────────────────────────────────────
  try {
    const logoBase64 = await loadBase64("/logo.png");
    const logoW = 28;
    const logoH = 14;
    doc.addImage(logoBase64, "PNG", W / 2 - logoW / 2, 20, logoW, logoH);
  } catch {
    // Fallback: brand text only
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 118, 143);
    doc.text("ZALGO EDUTECH", W / 2, 30, { align: "center" });
  }

  // Brand name below logo
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 118, 143);
  doc.setCharSpace(2.5);
  doc.text("ZALGO EDUTECH", W / 2, 37, { align: "center" });
  doc.setCharSpace(0);

  // ─── Diamond divider ──────────────────────────────────────────
  const drawDiamondDivider = (y: number) => {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 55, y, W / 2 - 8, y);
    doc.line(W / 2 + 8, y, W / 2 + 55, y);
    // Diamond
    doc.setFillColor(...gold);
    const d = 2.5;
    doc.lines([[d, -d], [d, d], [-d, d], [-d, -d]], W / 2 - d, y, [1, 1], "F");
  };
  drawDiamondDivider(41);

  // ─── Certificate title ────────────────────────────────────────
  doc.setFontSize(24);
  doc.setFont("times", "bolditalic");
  doc.setTextColor(30, 30, 30);
  doc.text("Certificate of Completion", W / 2, 54, { align: "center" });

  // Thin line under title
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 50, 57, W / 2 + 50, 57);

  // ─── This is to certify ───────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", W / 2, 66, { align: "center" });

  // ─── Student name ─────────────────────────────────────────────
  doc.setFontSize(30);
  doc.setFont("times", "bold");
  doc.setTextColor(0, 118, 143);
  doc.text(data.studentName, W / 2, 80, { align: "center" });

  // Name underline with flourish
  const nameW = doc.getTextWidth(data.studentName);
  doc.setDrawColor(0, 162, 194);
  doc.setLineWidth(0.9);
  doc.line(W / 2 - nameW / 2, 83, W / 2 + nameW / 2, 83);
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - nameW / 2 + 4, 85, W / 2 + nameW / 2 - 4, 85);

  // ─── Completion text ──────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(80, 80, 80);
  doc.text("has successfully completed the online course", W / 2, 93, { align: "center" });

  // ─── Course name ──────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  const courseLines = doc.splitTextToSize(data.courseName, 180);
  doc.text(courseLines, W / 2, 103, { align: "center" });

  // ─── Category badge ───────────────────────────────────────────
  const catY = courseLines.length > 1 ? 118 : 113;
  const catText = data.category.toUpperCase();
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 118, 143);
  const catW2 = doc.getTextWidth(catText) + 12;
  doc.setFillColor(230, 248, 252);
  doc.setDrawColor(0, 118, 143);
  doc.setLineWidth(0.5);
  doc.roundedRect(W / 2 - catW2 / 2, catY - 4.5, catW2, 7, 1.5, 1.5, "FD");
  doc.text(catText, W / 2, catY, { align: "center" });

  // ─── Bottom divider ───────────────────────────────────────────
  const divY = catY + 11;
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.5);
  doc.line(25, divY, W - 25, divY);
  doc.setDrawColor(0, 118, 143);
  doc.setLineWidth(0.2);
  doc.line(25, divY + 1.2, W - 25, divY + 1.2);

  // ─── Bottom row ───────────────────────────────────────────────
  const bY = divY + 11;
  const completedDate = new Date(data.completedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Left: Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.setCharSpace(1.2);
  doc.text("DATE OF COMPLETION", 62, bY - 4, { align: "center" });
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(completedDate, 62, bY + 3, { align: "center" });
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.4);
  doc.line(30, bY + 6, 94, bY + 6);

  // Center: Logo seal
  try {
    const logoBase64 = await loadBase64("/logo.png");
    // Teal circle background
    doc.setFillColor(0, 118, 143);
    doc.circle(W / 2, bY, 10, "F");
    doc.setFillColor(255, 252, 242);
    doc.circle(W / 2, bY, 8.5, "F");
    doc.addImage(logoBase64, "PNG", W / 2 - 7, bY - 4, 14, 7);
    // Gold ring
    doc.setDrawColor(201, 162, 39);
    doc.setLineWidth(0.8);
    doc.circle(W / 2, bY, 10);
  } catch {
    doc.setFillColor(0, 118, 143);
    doc.circle(W / 2, bY, 10, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ZE", W / 2, bY + 1.5, { align: "center" });
  }

  // Right: Certificate ID
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.setCharSpace(1.2);
  doc.text("CERTIFICATE ID", W - 62, bY - 4, { align: "center" });
  doc.setCharSpace(0);
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text(data.certId, W - 62, bY + 3, { align: "center" });
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.4);
  doc.line(W - 94, bY + 6, W - 30, bY + 6);

  // ─── Footer note ──────────────────────────────────────────────
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(
    "Zalgo Edutech  •  This certificate is issued digitally and is valid without a physical signature.",
    W / 2, H - 14, { align: "center" }
  );

  // Save
  const safeName = data.studentName.replace(/\s+/g, "_");
  const safeCourse = data.courseName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  doc.save(`Certificate_${safeName}_${safeCourse}.pdf`);
}
