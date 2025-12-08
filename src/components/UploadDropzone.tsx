"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

type Props = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
};

export function UploadDropzone({ onFileSelect, disabled }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    disabled,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/webp": [".webp"],
    },
  });

  const rejection = fileRejections[0];
  const rejectionMessage =
    rejection?.errors[0]?.message ??
    (rejection ? "Unsupported file. Please use PNG, JPG, or WEBP under 10MB." : undefined);

  return (
    <Card
      {...getRootProps()}
      className={`cursor-pointer border-dashed transition ${isDragActive ? "border-primary bg-primary/5" : ""} ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          {isDragActive ? <Upload className="h-7 w-7 text-primary" /> : <ImageIcon className="h-7 w-7 text-primary" />}
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Drop your image here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse · PNG, JPG, JPEG, WebP · up to 10MB
          </p>
        </div>
        {rejectionMessage ? (
          <p className="text-sm text-destructive">{rejectionMessage}</p>
        ) : isDragActive ? (
          <p className="text-sm text-muted-foreground">Release to upload</p>
        ) : (
          <p className="text-sm text-muted-foreground">We will show a preview once selected</p>
        )}
      </CardContent>
    </Card>
  );
}


