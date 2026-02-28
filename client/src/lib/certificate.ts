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

  const NAVY: [number, number, number] = [11, 31, 58];
  const GOLD: [number, number, number] = [212, 175, 55];
  const WHITE: [number, number, number] = [255, 255, 255];
  const GRAY: [number, number, number] = [120, 120, 120];

  // ── NAVY HEADER (y = 0 → 34) ─────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 34, "F");

  // Diagonal pattern lines (subtle gold tint)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.1);
  for (let x = -20; x < W + 20; x += 14) {
    doc.line(x, 0, x + 34, 34);
  }

  // Logo in header (try to load; fallback to text)
  try {
    const logoBase64 = await loadBase64("/logo.png");
    // White rounded backing so logo is visible on dark bg
    doc.setFillColor(...WHITE);
    doc.roundedRect(W / 2 - 20, 5, 40, 20, 2, 2, "F");
    doc.addImage(logoBase64, "PNG", W / 2 - 16, 7, 32, 16);
  } catch {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text("ZALGO EDUTECH", W / 2, 20, { align: "center" });
  }

  // Brand name below logo
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.setCharSpace(3.2);
  doc.text("ZALGO EDUTECH", W / 2, 30, { align: "center" });
  doc.setCharSpace(0);

  // ── GOLD RULE (y = 34 → 38) ──────────────────────────────────
  doc.setFillColor(...GOLD);
  doc.rect(0, 34, W, 4, "F");

  // ── CERTIFICATE OF COMPLETION label ──────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2.8);
  doc.text("CERTIFICATE OF COMPLETION", W / 2, 50, { align: "center" });
  doc.setCharSpace(0);

  // Navy accent line under label
  doc.setFillColor(...NAVY);
  doc.rect(W / 2 - 42, 54, 84, 1.5, "F");

  // ── "This is to certify that" ─────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text("This is to certify that", W / 2, 64, { align: "center" });

  // ── Student Name ──────────────────────────────────────────────
  doc.setFontSize(28);
  doc.setFont("times", "bold");
  doc.setTextColor(...NAVY);
  doc.text(data.studentName, W / 2, 78, { align: "center" });

  // Gold underline
  doc.setFillColor(...GOLD);
  doc.rect(W / 2 - 58, 82, 116, 2.5, "F");

  // ── "has successfully completed" ──────────────────────────────
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text("has successfully completed the online course", W / 2, 92, { align: "center" });

  // ── Course Name ───────────────────────────────────────────────
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  const courseLines = doc.splitTextToSize(data.courseName, 200);
  doc.text(courseLines, W / 2, 103, { align: "center" });

  // ── Category Badge ────────────────────────────────────────────
  const catY = courseLines.length > 1 ? 120 : 112;
  const catText = data.category.toUpperCase();
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.9);
  const catW = doc.getTextWidth(catText) + 14;
  doc.rect(W / 2 - catW / 2, catY - 4.5, catW, 7.5, "D");
  doc.text(catText, W / 2, catY, { align: "center" });

  // ── Divider before signatures ─────────────────────────────────
  const divY = catY + 13;
  doc.setFillColor(...GOLD);
  doc.rect(24, divY, W - 48, 1.5, "F");

  // ── SIGNATURE SECTION ─────────────────────────────────────────
  const sigTop = divY + 8;

  // Director 1 — Bhupendra Parmar (left side)
  try {
    const sig1 = await loadBase64("/sig_bhupendra.png");
    doc.addImage(sig1, "PNG", 22, sigTop, 52, 21, undefined, "FAST");
  } catch { /* skip */ }
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.6);
  doc.line(20, sigTop + 23, 85, sigTop + 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text("Bhupendra Parmar", 52, sigTop + 28, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("Director, Zalgo Edutech", 52, sigTop + 33, { align: "center" });

  // Director 2 — Lokendra Parmar (right side)
  try {
    const sig2 = await loadBase64("/sig_lokendra.png");
    doc.addImage(sig2, "PNG", W - 74, sigTop, 52, 21, undefined, "FAST");
  } catch { /* skip */ }
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.6);
  doc.line(W - 85, sigTop + 23, W - 20, sigTop + 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text("Lokendra Parmar", W - 52, sigTop + 28, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("Director, Zalgo Edutech", W - 52, sigTop + 33, { align: "center" });

  // ── Central Seal ──────────────────────────────────────────────
  const sealCX = W / 2;
  const sealCY = sigTop + 14;
  const sealR = 14;

  doc.setFillColor(...NAVY);
  doc.circle(sealCX, sealCY, sealR, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.circle(sealCX, sealCY, sealR);
  doc.setFillColor(...WHITE);
  doc.circle(sealCX, sealCY, sealR - 2.5, "F");

  try {
    const logoBase64 = await loadBase64("/logo.png");
    doc.addImage(logoBase64, "PNG", sealCX - 8.5, sealCY - 5, 17, 9);
  } catch {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text("ZE", sealCX, sealCY + 1, { align: "center" });
  }

  // "CERTIFIED" below seal
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.setCharSpace(1.5);
  doc.text("CERTIFIED", sealCX, sigTop + 33, { align: "center" });
  doc.setCharSpace(0);

  // ── GOLD RULE → FOOTER ────────────────────────────────────────
  const footerY = H - 22;
  doc.setFillColor(...GOLD);
  doc.rect(0, footerY, W, 4, "F");

  doc.setFillColor(...NAVY);
  doc.rect(0, footerY + 4, W, H - footerY - 4, "F");

  const completedDate = new Date(data.completedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.setCharSpace(1.5);
  doc.text("DATE OF COMPLETION", 62, footerY + 11, { align: "center" });
  doc.setCharSpace(0);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text(completedDate, 62, footerY + 17, { align: "center" });

  // Center dim text
  doc.setFontSize(6.5);
  doc.setTextColor(180, 180, 180);
  doc.text(
    "Zalgo Edutech  ·  Issued digitally  ·  Valid without physical signature",
    W / 2, footerY + 14, { align: "center" }
  );

  // Cert ID
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.setCharSpace(1.5);
  doc.text("CERTIFICATE ID", W - 62, footerY + 11, { align: "center" });
  doc.setCharSpace(0);
  doc.setFontSize(9.5);
  doc.setFont("courier", "normal");
  doc.setTextColor(...WHITE);
  doc.text(data.certId, W - 62, footerY + 17, { align: "center" });

  // Save
  const safeName = data.studentName.replace(/\s+/g, "_");
  const safeCourse = data.courseName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  doc.save(`Certificate_${safeName}_${safeCourse}.pdf`);
}
