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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Certificate Preview (Sample Data)</span>
            <Button onClick={handleDownload} disabled={loading} className="gap-2">
              <Download className="w-4 h-4" />
              {loading ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Certificate visual — A4 landscape proportions (297:210) */}
        <div
          className="w-full bg-[#FEFCF5] shadow-2xl mx-auto"
          style={{ aspectRatio: "297/210", maxWidth: 900, position: "relative", fontFamily: "serif" }}
        >
          {/* Outer border */}
          <div className="absolute inset-[2%] border-[5px] border-[#00A2C2]" />
          {/* Inner border */}
          <div className="absolute inset-[3.2%] border border-[#00A2C2]" />

          {/* Corner squares */}
          {[
            "top-[2%] left-[2%]",
            "top-[2%] right-[2%]",
            "bottom-[2%] left-[2%]",
            "bottom-[2%] right-[2%]",
          ].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-[2.5%] aspect-square bg-[#00A2C2]`} />
          ))}

          {/* Top accent bar */}
          <div className="absolute top-[2%] left-[2%] right-[2%] h-[1.2%] bg-[#00A2C2]" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-[6%] px-[6%]">
            {/* Top: brand */}
            <div className="text-center">
              <p
                className="font-bold tracking-[0.35em] text-[#00A2C2]"
                style={{ fontSize: "clamp(8px, 1.4vw, 13px)" }}
              >
                ZALGO EDUTECH
              </p>
              <div className="w-20 h-[1px] bg-[#00A2C2] mx-auto mt-1" />
            </div>

            {/* Middle: main content */}
            <div className="text-center flex-1 flex flex-col items-center justify-center gap-[2%]">
              <h1
                className="font-bold text-gray-900"
                style={{ fontSize: "clamp(16px, 3.5vw, 32px)", lineHeight: 1.1 }}
              >
                Certificate of Completion
              </h1>

              <p
                className="text-gray-500"
                style={{ fontSize: "clamp(8px, 1.2vw, 11px)" }}
              >
                This is to certify that
              </p>

              <div>
                <p
                  className="font-bold text-[#00768F]"
                  style={{ fontSize: "clamp(18px, 4vw, 36px)", lineHeight: 1 }}
                >
                  {SAMPLE.studentName}
                </p>
                <div
                  className="h-[2px] bg-[#00A2C2] mt-1 mx-auto"
                  style={{ width: "80%" }}
                />
              </div>

              <p
                className="text-gray-600"
                style={{ fontSize: "clamp(8px, 1.2vw, 11px)" }}
              >
                has successfully completed the course
              </p>

              <p
                className="font-bold text-gray-900 text-center leading-tight"
                style={{ fontSize: "clamp(12px, 2.2vw, 20px)", maxWidth: "70%" }}
              >
                {SAMPLE.courseName}
              </p>

              {/* Category badge */}
              <span
                className="border border-[#00A2C2] text-[#00A2C2] bg-[#E6F8FC] px-3 py-0.5 tracking-widest"
                style={{ fontSize: "clamp(6px, 0.9vw, 9px)" }}
              >
                {SAMPLE.category.toUpperCase()}
              </span>
            </div>

            {/* Bottom row */}
            <div className="w-full border-t border-gray-200 pt-[2%] flex items-start justify-between">
              {/* Date */}
              <div className="text-center">
                <p
                  className="font-bold text-gray-600 tracking-widest"
                  style={{ fontSize: "clamp(6px, 0.85vw, 8px)" }}
                >
                  DATE OF COMPLETION
                </p>
                <p
                  className="text-gray-800 mt-0.5"
                  style={{ fontSize: "clamp(7px, 0.95vw, 9px)" }}
                >
                  {date}
                </p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-[#00A2C2] flex items-center justify-center"
                  style={{ width: "clamp(32px, 5vw, 48px)", height: "clamp(32px, 5vw, 48px)" }}>
                  <div className="rounded-full bg-white flex items-center justify-center"
                    style={{ width: "80%", height: "80%" }}>
                    <div className="rounded-full bg-[#00A2C2] flex items-center justify-center"
                      style={{ width: "75%", height: "75%" }}>
                      <span
                        className="font-bold text-white"
                        style={{ fontSize: "clamp(6px, 0.9vw, 9px)" }}
                      >
                        ZE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cert ID */}
              <div className="text-center">
                <p
                  className="font-bold text-gray-600 tracking-widest"
                  style={{ fontSize: "clamp(6px, 0.85vw, 8px)" }}
                >
                  CERTIFICATE ID
                </p>
                <p
                  className="text-gray-800 mt-0.5 font-mono"
                  style={{ fontSize: "clamp(6px, 0.85vw, 8px)" }}
                >
                  {SAMPLE.certId}
                </p>
              </div>
            </div>
          </div>

          {/* Watermark footnote */}
          <div
            className="absolute bottom-[3.5%] left-0 right-0 text-center text-gray-400"
            style={{ fontSize: "clamp(5px, 0.7vw, 7px)" }}
          >
            Zalgo Edutech • This certificate is issued digitally and is valid without a physical signature.
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          The PDF download will look identical to this preview. Click "Download PDF" above to get the actual file.
        </p>
      </div>
    </div>
  );
}
