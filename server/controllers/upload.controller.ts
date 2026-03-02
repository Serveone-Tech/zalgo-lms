import type { Request, Response } from "express";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";

export async function getUploadSignature(req: Request, res: Response) {
  if (!isCloudinaryConfigured) {
    return res.status(503).json({
      message:
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to your environment.",
    });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "zalgo-edutech/videos";

  const signParams: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    signParams,
    process.env.CLOUDINARY_API_SECRET!,
  );

  res.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}

export async function deleteVideo(req: Request, res: Response) {
  if (!isCloudinaryConfigured) {
    return res.status(503).json({ message: "Cloudinary is not configured." });
  }

  const { publicId } = req.body;
  if (!publicId)
    return res.status(400).json({ message: "publicId is required" });

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
