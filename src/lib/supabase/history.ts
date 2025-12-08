import { getSupabaseServerClient } from "./server";
import type { UpscaleResult } from "../types";

export async function saveUpscaleHistory(
  userId: string,
  payload: UpscaleResult,
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from("upscaled_images").insert({
    user_id: userId,
    original_url: payload.originalUrl,
    upscaled_url: payload.upscaledUrl,
    upscale_factor: payload.upscaleFactor,
    original_width: payload.originalWidth,
    original_height: payload.originalHeight,
    upscaled_width: payload.upscaledWidth,
    upscaled_height: payload.upscaledHeight,
  });

  if (error) {
    console.error("[Supabase] Failed to save history", error);
  }
}

export async function getUpscaleHistory(userId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("upscaled_images")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch history", error);
    return [];
  }

  return (
    data?.map((item) => ({
      id: item.id as string,
      originalUrl: item.original_url as string,
      upscaledUrl: item.upscaled_url as string,
      upscaleFactor: item.upscale_factor as number,
      originalWidth: item.original_width as number,
      originalHeight: item.original_height as number,
      upscaledWidth: item.upscaled_width as number,
      upscaledHeight: item.upscaled_height as number,
      createdAt: item.created_at as string,
    })) ?? []
  );
}


