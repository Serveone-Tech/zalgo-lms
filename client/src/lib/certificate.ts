import { jsPDF } from "jspdf";

export interface CertificateData {
  studentName: string;
  courseName: string;
  category: string;
  completedAt: string;
  certId: string;
}

export async function downloadCertificate(data: CertificateData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const W = 297;
  const H = 210;

  // Background — cream white
  doc.setFillColor(254, 252, 245);
  doc.rect(0, 0, W, H, "F");

  // Outer border — thick teal
  doc.setDrawColor(0, 162, 194);
  doc.setLineWidth(6);
  doc.rect(8, 8, W - 16, H - 16);

  // Inner border — thin teal
  doc.setLineWidth(1.2);
  doc.rect(12, 12, W - 24, H - 24);

  // Corner decorative squares
  const corners = [[8, 8], [W - 16, 8], [8, H - 16], [W - 16, H - 16]];
  corners.forEach(([cx, cy]) => {
    doc.setFillColor(0, 162, 194);
    doc.rect(cx, cy, 8, 8, "F");
  });

  // Top accent bar
  doc.setFillColor(0, 162, 194);
  doc.rect(8, 8, W - 16, 2, "F");

  // Header — platform name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 162, 194);
  doc.text("ZALGO EDUTECH", W / 2, 32, { align: "center" });

  // Subtitle line
  doc.setDrawColor(0, 162, 194);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 40, 35, W / 2 + 40, 35);

  // Certificate title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Certificate of Completion", W / 2, 52, { align: "center" });

  // Presented to label
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", W / 2, 66, { align: "center" });

  // Student Name — large prominent
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 118, 143);
  doc.text(data.studentName, W / 2, 84, { align: "center" });

  // Underline below name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(0, 162, 194);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - nameWidth / 2, 87, W / 2 + nameWidth / 2, 87);

  // Completion text
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("has successfully completed the course", W / 2, 97, { align: "center" });

  // Course Name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  const courseLines = doc.splitTextToSize(data.courseName, 200);
  doc.text(courseLines, W / 2, 110, { align: "center" });

  // Category badge area
  const categoryY = courseLines.length > 1 ? 126 : 120;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 162, 194);
  const catText = data.category.toUpperCase();
  const catW = doc.getTextWidth(catText) + 10;
  doc.setFillColor(230, 248, 252);
  doc.setDrawColor(0, 162, 194);
  doc.setLineWidth(0.4);
  doc.roundedRect(W / 2 - catW / 2, categoryY - 5, catW, 7, 2, 2, "FD");
  doc.text(catText, W / 2, categoryY, { align: "center" });

  // Divider
  const divY = categoryY + 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(40, divY, W - 40, divY);

  // Bottom info row
  const bottomY = divY + 14;
  const completedDate = new Date(data.completedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });

  // Date of completion
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("DATE OF COMPLETION", 60, bottomY - 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(completedDate, 60, bottomY + 2, { align: "center" });

  // Center seal
  doc.setFillColor(0, 162, 194);
  doc.circle(W / 2, bottomY - 2, 10, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(W / 2, bottomY - 2, 8, "F");
  doc.setFillColor(0, 162, 194);
  doc.circle(W / 2, bottomY - 2, 6, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("ZE", W / 2, bottomY - 0.5, { align: "center" });

  // Certificate ID
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("CERTIFICATE ID", W - 60, bottomY - 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text(data.certId, W - 60, bottomY + 2, { align: "center" });

  // Bottom watermark text
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text("Zalgo Edutech • www.zalgoedutech.com • This certificate is issued digitally and is valid without a physical signature.", W / 2, H - 18, { align: "center" });

  // Save the PDF
  const safeName = data.studentName.replace(/\s+/g, "_");
  const safeCourse = data.courseName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  doc.save(`Certificate_${safeName}_${safeCourse}.pdf`);
}
