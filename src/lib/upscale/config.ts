export const SUPPORTED_UPSCALE_FACTORS = [2, 4] as const;
export const DEFAULT_UPSCALE_FACTOR = SUPPORTED_UPSCALE_FACTORS[0];

export const MOCK_UPSCALED_IMAGES: Record<number, string> = {
  2: "/mock/upscaled-2x.png",
  4: "/mock/upscaled-4x.png",
};

export const UPSCALE_API_KEY = process.env.REAL_UPSCALE_API_KEY;
export const UPSCALE_PROVIDER_URL = "https://clipdrop-api.co/image-upscaling/v1";
export const UPSCALE_PROVIDER_FALLBACK_URL = "https://clipdrop-api.co/image-upscaling/v1/upscale";


