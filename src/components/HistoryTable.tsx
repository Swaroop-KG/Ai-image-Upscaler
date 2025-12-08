import Image from "next/image";
import { Clock3, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HistoryItem } from "@/lib/types";

type Props = {
  items: HistoryItem[];
};

export function HistoryTable({ items }: Props) {
  if (!items.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No history yet. Upscale an image to see it here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Upscale {item.upscaleFactor}x</p>
                <p className="text-xs text-muted-foreground">
                  {item.originalWidth}x{item.originalHeight} → {item.upscaledWidth}x{item.upscaledHeight}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}
              </span>
            </div>
            <div className="relative h-40 overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src={item.upscaledUrl}
                alt="Upscaled result"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex items-center justify-end">
              <Button asChild variant="outline" size="sm">
                <a href={item.upscaledUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


