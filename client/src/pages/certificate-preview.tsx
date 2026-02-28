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
    <div className="min-h-screen bg-slate-300 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">Sample Preview</span>
            <Button onClick={handleDownload} disabled={loading} className="gap-2">
              <Download className="w-4 h-4" />
              {loading ? "Generating PDF…" : "Download PDF"}
            </Button>
          </div>
        </div>

        <CertificateCard
          studentName={SAMPLE.studentName}
          courseName={SAMPLE.courseName}
          category={SAMPLE.category}
          date={date}
          certId={SAMPLE.certId}
        />

        <p className="text-center text-xs text-slate-500 mt-4">
          The downloaded PDF will closely match this design.
        </p>
      </div>
    </div>
  );
}

export function CertificateCard({
  studentName,
  courseName,
  category,
  date,
  certId,
}: {
  studentName: string;
  courseName: string;
  category: string;
  date: string;
  certId: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        width: "100%",
        boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        border: "1px solid #d1d5db",
      }}
    >
      {/* ── Navy Header ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1F3A 0%, #122944 50%, #0B1F3A 100%)",
          padding: "28px 48px 22px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "repeating-linear-gradient(45deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 12px)",
          }}
        />
        <div style={{ position: "relative" }}>
          <img
            src="/logo.png"
            alt="Zalgo Edutech"
            style={{ height: 54, objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <p
            style={{
              color: "#D4AF37",
              letterSpacing: "0.5em",
              fontSize: 10,
              fontFamily: "Arial, sans-serif",
              marginTop: 10,
              fontWeight: 700,
            }}
          >
            ZALGO EDUTECH
          </p>
        </div>
      </div>

      {/* ── Gold Rule ────────────────────────────────────────────── */}
      <div
        style={{
          height: 5,
          background: "linear-gradient(90deg, #8B6914, #D4AF37, #F5D060, #D4AF37, #8B6914)",
        }}
      />

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{ padding: "40px 72px 28px", textAlign: "center" }}>
        <p
          style={{
            color: "#C9A82C",
            letterSpacing: "0.38em",
            fontSize: 10.5,
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            margin: "0 0 16px",
          }}
        >
          CERTIFICATE OF COMPLETION
        </p>

        <div
          style={{
            width: 90,
            height: 2,
            background: "#0B1F3A",
            margin: "0 auto 20px",
            borderRadius: 2,
          }}
        />

        <p
          style={{
            color: "#9ca3af",
            fontSize: 12,
            fontStyle: "italic",
            margin: "0 0 16px",
          }}
        >
          This is to certify that
        </p>

        <h1
          style={{
            color: "#0B1F3A",
            fontSize: 48,
            fontWeight: 700,
            margin: "0 0 10px",
            lineHeight: 1.1,
          }}
        >
          {studentName}
        </h1>

        <div
          style={{
            width: 220,
            height: 3,
            background: "linear-gradient(90deg, transparent, #D4AF37 20%, #D4AF37 80%, transparent)",
            margin: "0 auto 22px",
          }}
        />

        <p
          style={{
            color: "#9ca3af",
            fontSize: 12,
            fontStyle: "italic",
            margin: "0 0 14px",
          }}
        >
          has successfully completed the online course
        </p>

        <h2
          style={{
            color: "#0B1F3A",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 auto 20px",
            maxWidth: 540,
            lineHeight: 1.35,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {courseName}
        </h2>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <span
            style={{
              border: "1.5px solid #0B1F3A",
              color: "#0B1F3A",
              padding: "4px 20px",
              fontSize: 9,
              letterSpacing: "0.28em",
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
            }}
          >
            {category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div style={{ margin: "0 52px" }}>
        <div style={{ height: 1.5, background: "#D4AF37" }} />
        <div style={{ height: 1, background: "#0B1F3A", opacity: 0.1, marginTop: 3 }} />
      </div>

      {/* ── Signature Section ────────────────────────────────────── */}
      <div
        style={{
          padding: "22px 56px 28px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Left director */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <img
            src="/sig_bhupendra.png"
            alt="Bhupendra Parmar"
            style={{
              height: 52,
              objectFit: "contain",
              filter: "contrast(1.2) brightness(0.85)",
              maxWidth: "100%",
            }}
          />
          <div style={{ height: 1.5, background: "#374151", margin: "6px 0 5px" }} />
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "#0B1F3A",
              margin: 0,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Bhupendra Parmar
          </p>
          <p
            style={{
              fontSize: 10.5,
              color: "#6b7280",
              fontFamily: "Arial, sans-serif",
              margin: "3px 0 0",
            }}
          >
            Director, Zalgo Edutech
          </p>
        </div>

        {/* Central seal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0B1F3A, #1a3a5c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #D4AF37",
              boxShadow: "0 0 0 6px rgba(212,175,55,0.12), 0 6px 24px rgba(11,31,58,0.35)",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/logo.png"
                alt="ZE"
                style={{ width: 48, objectFit: "contain" }}
              />
            </div>
          </div>
          <p
            style={{
              fontSize: 7.5,
              letterSpacing: "0.22em",
              color: "#D4AF37",
              fontFamily: "Arial",
              margin: 0,
              fontWeight: 700,
            }}
          >
            CERTIFIED
          </p>
        </div>

        {/* Right director */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <img
            src="/sig_lokendra.png"
            alt="Lokendra Parmar"
            style={{
              height: 52,
              objectFit: "contain",
              filter: "contrast(1.2) brightness(0.85)",
              maxWidth: "100%",
            }}
          />
          <div style={{ height: 1.5, background: "#374151", margin: "6px 0 5px" }} />
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "#0B1F3A",
              margin: 0,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Lokendra Parmar
          </p>
          <p
            style={{
              fontSize: 10.5,
              color: "#6b7280",
              fontFamily: "Arial, sans-serif",
              margin: "3px 0 0",
            }}
          >
            Director, Zalgo Edutech
          </p>
        </div>
      </div>

      {/* ── Gold Rule ────────────────────────────────────────────── */}
      <div
        style={{
          height: 5,
          background: "linear-gradient(90deg, #8B6914, #D4AF37, #F5D060, #D4AF37, #8B6914)",
        }}
      />

      {/* ── Navy Footer ──────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1F3A 0%, #122944 100%)",
          padding: "13px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              color: "#D4AF37",
              fontSize: 7.5,
              letterSpacing: "0.22em",
              fontFamily: "Arial",
              margin: 0,
              fontWeight: 700,
            }}
          >
            DATE OF COMPLETION
          </p>
          <p
            style={{
              color: "#fff",
              fontSize: 11,
              margin: "3px 0 0",
              fontFamily: "Arial",
            }}
          >
            {date}
          </p>
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.28)",
            fontSize: 8,
            fontFamily: "Arial",
            textAlign: "center",
            margin: 0,
          }}
        >
          Zalgo Edutech · Issued digitally · Valid without physical signature
        </p>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              color: "#D4AF37",
              fontSize: 7.5,
              letterSpacing: "0.22em",
              fontFamily: "Arial",
              margin: 0,
              fontWeight: 700,
            }}
          >
            CERTIFICATE ID
          </p>
          <p
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily: "monospace",
              margin: "3px 0 0",
            }}
          >
            {certId}
          </p>
        </div>
      </div>
    </div>
  );
}
