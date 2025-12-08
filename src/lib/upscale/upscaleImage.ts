import { promises as fs } from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import {
  MOCK_UPSCALED_IMAGES,
  UPSCALE_API_KEY,
  UPSCALE_PROVIDER_FALLBACK_URL,
  UPSCALE_PROVIDER_URL,
} from "./config";

type UpscaleInput = {
  /** Absolute path to the saved original file on disk (usually under public/uploads). */
  filePath: string;
  factor: number;
  originalWidth: number;
  originalHeight: number;
};

type UpscaleOutput = {
  /** Public URL to the upscaled image. In mock mode we simply reuse the uploaded file URL. */
  upscaledUrl: string;
  upscaledWidth: number;
  upscaledHeight: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getMimeFromExt = (ext: string) => {
  const lower = ext.toLowerCase();
  if (lower === ".jpg" || lower === ".jpeg") return "image/jpeg";
  if (lower === ".png") return "image/png";
  if (lower === ".webp") return "image/webp";
  return "application/octet-stream";
};

async function upscaleViaProvider(
  inputPath: string,
  outputPath: string,
  targetWidth: number,
  targetHeight: number,
): Promise<void> {
  if (!UPSCALE_API_KEY) {
    throw new Error("Missing REAL_UPSCALE_API_KEY");
  }
  const apiKey = UPSCALE_API_KEY as string;

  const ext = path.extname(inputPath) || ".png";
  const mime = getMimeFromExt(ext);
  const buffer = await fs.readFile(inputPath);
  const blob = new Blob([buffer], { type: mime });

  const formData = new FormData();
  formData.append("image_file", blob, path.basename(inputPath));
  formData.append("target_width", String(targetWidth));
  formData.append("target_height", String(targetHeight));

  const attempt = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const details = errorText ? `: ${errorText}` : "";
      throw new Error(`Upscale provider error ${response.status}${details}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputPath, resultBuffer);
  };

  try {
    await attempt(UPSCALE_PROVIDER_URL);
  } catch (firstError) {
    // If the primary endpoint 404s, retry the legacy "/upscale" route once.
    if (
      firstError instanceof Error &&
      firstError.message.includes("Upscale provider error 404") &&
      UPSCALE_PROVIDER_FALLBACK_URL
    ) {
      await attempt(UPSCALE_PROVIDER_FALLBACK_URL);
      return;
    }
    throw firstError;
  }
}

export async function upscaleImage({
  filePath,
  factor,
  originalWidth,
  originalHeight,
}: UpscaleInput): Promise<UpscaleOutput> {
  // Simulate network/model latency to keep UI feedback.
  await sleep(1200);

  // Cap provider input to its max (4096px) while keeping aspect ratio.
  const maxProviderDim = 4096;
  const scaleCap = Math.min(
    factor,
    maxProviderDim / originalWidth,
    maxProviderDim / originalHeight,
  );
  const effectiveScale = Math.max(1, scaleCap);

  const upscaledWidth = Math.round(originalWidth * effectiveScale);
  const upscaledHeight = Math.round(originalHeight * effectiveScale);

  // Use tmp dir so it works on serverless hosts; we return data URLs to the client.
  const tmpDir = os.tmpdir();
  const ext = path.extname(filePath) || ".png";
  const base = path.basename(filePath, ext);
  const upscaledFileName = `${base}-upscaled-${factor}x${ext}`;
  const upscaledPath = path.join(tmpDir, upscaledFileName);

  let upscaledUrl = MOCK_UPSCALED_IMAGES[factor] ?? "/mock/upscaled-placeholder.png";

  try {
    const hasApiKey = Boolean(UPSCALE_API_KEY);

    if (hasApiKey) {
      // Prefer real AI upscaling; surface provider failures to the client.
      await upscaleViaProvider(filePath, upscaledPath, upscaledWidth, upscaledHeight);
    } else {
      // No API key: fallback to sharp resize so the flow still works.
      await sharp(filePath)
        .resize({ width: upscaledWidth, height: upscaledHeight, fit: "fill" })
        .toFile(upscaledPath);
    }

    // Return as data URL so it is displayable/downloadable without relying on public/ writes.
    const mime = getMimeFromExt(ext);
    const buf = await fs.readFile(upscaledPath);
    upscaledUrl = `data:${mime};base64,${buf.toString("base64")}`;
  } catch (error) {
    // If we have a key, fail loudly so the client knows the AI call failed.
    if (UPSCALE_API_KEY) {
      throw error;
    }
    // Without a key, fallback to mock asset to keep UX smooth.
    console.warn("upscaleImage: sharp resize failed, using mock asset", error);
  }

  return {
    upscaledUrl,
    upscaledWidth,
    upscaledHeight,
  };
}
