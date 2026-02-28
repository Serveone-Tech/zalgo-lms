import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { downloadCertificate } from "@/lib/certificate";
import { useState } from "react";

const SAMPLE = {
  studentName: "Rahul Sharma",
  courseName: "Complete React & Node.js Bootcamp",
  category: "Web Development",
  completedAt: new Date().toISOString(),
  certId: "ZE-0001-C001-X7K2P",
};

function DiamondDivider() {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px bg-[#C9A227]" />
      <div className="w-2.5 h-2.5 bg-[#C9A227] rotate-45" />
      <div className="flex-1 h-px bg-[#C9A227]" />
    </div>
  );
}

export default function CertificatePreviewPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await downloadCertificate(SAMPLE);
    setLoading(false);
  };

  const date = new Date(SAMPLE.completedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sample Preview</span>
            <Button onClick={handleDownload} disabled={loading} className="gap-2">
              <Download className="w-4 h-4" />
              {loading ? "Generating PDF…" : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* ── Certificate card ─────────────────────────────────────── */}
        <div
          className="relative w-full shadow-2xl overflow-hidden"
          style={{
            aspectRatio: "297/210",
            maxWidth: 900,
            margin: "0 auto",
            backgroundColor: "#FFFCF2",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {/* Top teal band */}
          <div className="absolute top-0 left-0 right-0 h-[5%] bg-[#00768F]" />
          <div className="absolute top-[5%] left-0 right-0 h-[1%] bg-[#C9A227]" />

          {/* Bottom teal band */}
          <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-[#00768F]" />
          <div className="absolute bottom-[5%] left-0 right-0 h-[1%] bg-[#C9A227]" />

          {/* Outer teal border */}
          <div className="absolute inset-[6%] border-2 border-[#00768F]" />
          {/* Inner gold border */}
          <div className="absolute inset-[7.5%] border border-[#C9A227]" />

          {/* Corner ornaments */}
          {([
            "top-[6%] left-[6%]",
            "top-[6%] right-[6%]",
            "bottom-[6%] left-[6%]",
            "bottom-[6%] right-[6%]",
          ] as const).map((cls, i) => (
            <div key={i} className={`absolute ${cls}`} style={{ width: "4%", aspectRatio: "1" }}>
              <div className="absolute inset-0 bg-[#00768F]" />
              {/* Gold L */}
              <div
                className="absolute bg-[#C9A227]"
                style={{
                  width: "30%", height: "100%",
                  left: i % 2 === 0 ? 0 : "auto",
                  right: i % 2 !== 0 ? 0 : "auto",
                }}
              />
              <div
                className="absolute bg-[#C9A227]"
                style={{
                  height: "30%", width: "100%",
                  top: i < 2 ? 0 : "auto",
                  bottom: i >= 2 ? 0 : "auto",
                }}
              />
            </div>
          ))}

          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ opacity: 0.04, fontSize: "clamp(24px, 7vw, 60px)", fontWeight: 900, letterSpacing: "0.15em", color: "#00768F" }}
          >
            CERTIFICATE
          </div>

          {/* ── Content ────────────────────────────────────────────── */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-[7%] px-[8%]">

            {/* Header */}
            <div className="flex flex-col items-center gap-[0.4%]">
              <img
                src="/logo.png"
                alt="Zalgo Edutech"
                style={{ height: "clamp(20px, 4vw, 38px)", objectFit: "contain" }}
              />
              <p
                className="font-bold text-[#00768F] tracking-[0.3em]"
                style={{ fontSize: "clamp(6px, 1.1vw, 11px)", fontFamily: "Arial, sans-serif" }}
              >
                ZALGO EDUTECH
              </p>
              <DiamondDivider />
            </div>

            {/* Main body */}
            <div className="flex flex-col items-center gap-[1.2%] text-center flex-1 justify-center">
              <h1
                className="text-gray-900 font-bold italic"
                style={{ fontSize: "clamp(16px, 3.2vw, 30px)", lineHeight: 1.1 }}
              >
                Certificate of Completion
              </h1>
              <div className="w-24 h-px bg-[#C9A227] opacity-70" />

              <p
                className="text-gray-400 italic"
                style={{ fontSize: "clamp(7px, 1.1vw, 10px)" }}
              >
                This is to certify that
              </p>

              <div className="flex flex-col items-center gap-[0.5%]">
                <p
                  className="font-bold text-[#00768F]"
                  style={{ fontSize: "clamp(18px, 3.8vw, 36px)", lineHeight: 1 }}
                >
                  {SAMPLE.studentName}
                </p>
                <div className="w-full flex flex-col items-center gap-[0.3%]">
                  <div className="h-[2px] bg-[#00A2C2]" style={{ width: "90%" }} />
                  <div className="h-px bg-[#C9A227] opacity-60" style={{ width: "70%" }} />
                </div>
              </div>

              <p
                className="text-gray-500 italic"
                style={{ fontSize: "clamp(7px, 1.1vw, 10px)" }}
              >
                has successfully completed the online course
              </p>

              <p
                className="font-bold text-gray-900 leading-tight"
                style={{ fontSize: "clamp(12px, 2vw, 18px)", maxWidth: "70%" }}
              >
                {SAMPLE.courseName}
              </p>

              <div
                className="border border-[#00768F] bg-[#E6F8FC] text-[#00768F] font-bold tracking-widest px-3 py-0.5"
                style={{ fontSize: "clamp(5px, 0.75vw, 7.5px)", fontFamily: "Arial, sans-serif" }}
              >
                {SAMPLE.category.toUpperCase()}
              </div>
            </div>

            {/* Bottom row */}
            <div className="w-full">
              {/* Double divider */}
              <div className="w-full h-px bg-[#C9A227] mb-[0.5%]" />
              <div className="w-full h-px bg-[#00768F] opacity-30 mb-[1%]" />

              <div className="flex items-start justify-between">
                {/* Date */}
                <div className="flex flex-col items-center gap-[0.3%]">
                  <p
                    className="font-bold text-gray-500 tracking-widest"
                    style={{ fontSize: "clamp(5px, 0.75vw, 7px)", fontFamily: "Arial, sans-serif" }}
                  >
                    DATE OF COMPLETION
                  </p>
                  <p
                    className="text-gray-800"
                    style={{ fontSize: "clamp(6px, 0.9vw, 8.5px)" }}
                  >
                    {date}
                  </p>
                  <div className="h-px bg-[#C9A227] w-full mt-[0.5%]" />
                </div>

                {/* Seal with logo */}
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full bg-[#00768F] flex items-center justify-center ring-2 ring-[#C9A227]"
                    style={{ width: "clamp(30px, 5.5vw, 52px)", height: "clamp(30px, 5.5vw, 52px)" }}
                  >
                    <div
                      className="rounded-full bg-[#FFFCF2] flex items-center justify-center"
                      style={{ width: "80%", height: "80%" }}
                    >
                      <img
                        src="/logo.png"
                        alt="ZE"
                        style={{ width: "75%", height: "auto", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cert ID */}
                <div className="flex flex-col items-center gap-[0.3%]">
                  <p
                    className="font-bold text-gray-500 tracking-widest"
                    style={{ fontSize: "clamp(5px, 0.75vw, 7px)", fontFamily: "Arial, sans-serif" }}
                  >
                    CERTIFICATE ID
                  </p>
                  <p
                    className="text-gray-800 font-mono"
                    style={{ fontSize: "clamp(6px, 0.9vw, 8.5px)" }}
                  >
                    {SAMPLE.certId}
                  </p>
                  <div className="h-px bg-[#C9A227] w-full mt-[0.5%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Footnote inside bottom teal band */}
          <div
            className="absolute bottom-[1%] left-0 right-0 text-center text-white/60"
            style={{ fontSize: "clamp(4px, 0.6vw, 6px)", fontFamily: "Arial, sans-serif" }}
          >
            Zalgo Edutech  •  This certificate is issued digitally and is valid without a physical signature.
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          The downloaded PDF will match this design exactly.
        </p>
      </div>
    </div>
  );
}
