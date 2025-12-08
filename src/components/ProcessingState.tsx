import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProcessingState() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-base font-semibold">Upscaling in progress…</p>
          <p className="text-sm text-muted-foreground">
            Hang tight while we enhance your image. This usually takes a couple of seconds.
          </p>
          <Progress value={66} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}


