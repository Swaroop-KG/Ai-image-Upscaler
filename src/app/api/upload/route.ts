import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { promises as fs } from "fs";
import sizeOf from "image-size";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { SUPPORTED_UPSCALE_FACTORS } from "@/lib/upscale/config";
import { upscaleImage } from "@/lib/upscale/upscaleImage";
import type { UpscaleResult } from "@/lib/types";
import { auth } from "@/lib/auth";
import { saveUpscaleHistory } from "@/lib/supabase/history";

export const runtime = "nodejs"; // ensure fs access

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const factorRaw = formData.get("factor");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const factor = Number(factorRaw ?? 0);
    if (!SUPPORTED_UPSCALE_FACTORS.includes(factor as (typeof SUPPORTED_UPSCALE_FACTORS)[number])) {
      return NextResponse.json({ error: "Invalid upscale factor." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported format. Please upload PNG/JPG/JPEG/WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 10MB)." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${randomUUID()}.${ext}`;
    const filePathOnDisk = path.join(uploadsDir, fileName);

    await fs.writeFile(filePathOnDisk, buffer);

    const dimensions = sizeOf(buffer);
    const originalWidth = dimensions.width ?? 0;
    const originalHeight = dimensions.height ?? 0;

    if (!originalWidth || !originalHeight) {
      return NextResponse.json(
        { error: "Unable to read image dimensions. Please try another image." },
        { status: 400 },
      );
    }

    const originalUrl = `/uploads/${fileName}`;

    const upscaleResult = await upscaleImage({
      filePath: filePathOnDisk,
      factor,
      originalWidth,
      originalHeight,
    });

    const payload: UpscaleResult = {
      originalUrl,
      upscaledUrl: upscaleResult.upscaledUrl,
      originalWidth,
      originalHeight,
      upscaledWidth: upscaleResult.upscaledWidth,
      upscaledHeight: upscaleResult.upscaledHeight,
      upscaleFactor: factor,
    };

    const session = await auth();
    const userId = session?.user?.id;
    if (userId) {
      void saveUpscaleHistory(userId, payload);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("/api/upload error", error);
    return NextResponse.json(
      { error: "Something went wrong while upscaling. Please try again." },
      { status: 500 },
    );
  }
}
