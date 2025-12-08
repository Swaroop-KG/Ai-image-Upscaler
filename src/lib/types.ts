export type UpscaleResult = {
  originalUrl: string;
  upscaledUrl: string;
  originalWidth: number;
  originalHeight: number;
  upscaledWidth: number;
  upscaledHeight: number;
  upscaleFactor: number;
  createdAt?: string;
};

export type HistoryItem = UpscaleResult & {
  id: string;
};


