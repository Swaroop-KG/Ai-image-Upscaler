"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadDropzone } from "@/components/UploadDropzone";
import { UpscaleOptions } from "@/components/UpscaleOptions";
import { ProcessingState } from "@/components/ProcessingState";
import { BeforeAfterCompare } from "@/components/BeforeAfterCompare";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_UPSCALE_FACTOR } from "@/lib/upscale/config";
import type { UpscaleResult } from "@/lib/types";
import { toast } from "sonner";

const formSchema = z.object({
  factor: z.number().int().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      factor: DEFAULT_UPSCALE_FACTOR,
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      setError("Please select an image first.");
      toast.error("Please select an image first.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("factor", String(values.factor));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error ?? "Something went wrong while upscaling.";
        throw new Error(message);
      }

      const data = (await response.json()) as UpscaleResult & {
        originalUrl: string;
        upscaledUrl: string;
      };

      setResult(data);
      toast.success("Image upscaled successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentFactor = form.watch("factor");

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-start">
        <div className="space-y-5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Upscale your images with AI clarity
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Upload a photo, choose your upscale factor, and we&apos;ll enhance it in a few
            seconds. Perfect for product photos, portraits, and social media images.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-slate-100 px-3 py-1">PNG / JPG / WebP</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Up to 10MB</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Mock AI upscaler (swap later)</span>
          </div>
        </div>
        <div className="relative h-40 overflow-hidden rounded-xl border bg-slate-950/95 text-slate-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#4f46e5_0,_transparent_55%)] opacity-40" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-slate-300">Powered by AI</p>
              <p className="text-lg font-semibold">Sharper images, same file</p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>2x & 4x upscaling · No artifacts</span>
              <span>Mock mode · Safe to test</span>
            </div>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Upload &amp; upscale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UploadDropzone onFileSelect={handleFileSelect} disabled={isProcessing} />

          {previewUrl && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,_1.5fr)_minmax(0,_1fr)] md:items-center">
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview</p>
                <div className="relative h-64 overflow-hidden rounded-lg border bg-muted/40">
                  <Image
                    src={previewUrl}
                    alt="Selected preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <UpscaleOptions
                  value={currentFactor}
                  onChange={(factor) => form.setValue("factor", factor)}
                  disabled={isProcessing}
                />
                <Button
                  className="w-full md:w-auto"
                  size="lg"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Upscaling…" : `Upscale ${currentFactor}x`}
                </Button>
              </div>
            </div>
          )}

          {!previewUrl && (
            <p className="text-sm text-muted-foreground">
              Start by dropping an image above. We&apos;ll show the original preview and
              resolution once it&apos;s loaded.
            </p>
          )}

          {isProcessing && <ProcessingState />}

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <p className="font-semibold">Upscale failed</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          )}

          {result && <BeforeAfterCompare result={result} />}
        </CardContent>
      </Card>
    </div>
  );
}
