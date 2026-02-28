import type { Request, Response, NextFunction } from "express";

const SUSPICIOUS_PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i, /union.*select/i, /drop\s+table/i];

function secLog(message: string) {
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${time} [security] ${message}`);
}

export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const body = JSON.stringify(req.body ?? "");
  const url = req.originalUrl;

  const isSuspicious = SUSPICIOUS_PATTERNS.some(p => p.test(url) || p.test(body));
  if (isSuspicious) {
    secLog(`SUSPICIOUS request from ${req.ip} → ${req.method} ${url}`);
  }

  res.on("finish", () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      secLog(`${res.statusCode} from ${req.ip} → ${req.method} ${url}`);
    }
  });

  next();
}
