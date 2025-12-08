"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_UPSCALE_FACTORS } from "@/lib/upscale/config";

type Props = {
  value: number;
  onChange: (factor: number) => void;
  disabled?: boolean;
};

export function UpscaleOptions({ value, onChange, disabled }: Props) {
  const options = useMemo(() => SUPPORTED_UPSCALE_FACTORS, []);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="upscale">Upscale factor</Label>
      <Select
        disabled={disabled}
        value={String(value)}
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select factor" />
        </SelectTrigger>
        <SelectContent>
          {options.map((factor) => (
            <SelectItem key={factor} value={String(factor)}>
              {factor}x
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


