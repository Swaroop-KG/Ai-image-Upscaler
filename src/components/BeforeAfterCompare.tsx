import Image from "next/image";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UpscaleResult } from "@/lib/types";

type Props = {
  result: UpscaleResult;
};

export function BeforeAfterCompare({ result }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase text-muted-foreground">Original</p>
            <p className="text-sm text-muted-foreground">
              {result.originalWidth}x{result.originalHeight}
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-lg border bg-muted/30">
            <Image
              src={result.originalUrl}
              alt="Original image"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-muted-foreground">Upscaled</p>
              <p className="text-sm text-muted-foreground">
                {result.upscaledWidth}x{result.upscaledHeight} ({result.upscaleFactor}x)
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={result.upscaledUrl} download>
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          </div>
          <div className="relative h-72 overflow-hidden rounded-lg border bg-muted/30">
            <Image
              src={result.upscaledUrl}
              alt="Upscaled image"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {result.originalWidth}x{result.originalHeight} → {result.upscaledWidth}x{result.upscaledHeight} (
            {result.upscaleFactor}x)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


