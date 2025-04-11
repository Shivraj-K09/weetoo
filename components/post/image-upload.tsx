"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { ImageCarousel } from "./image-carousel";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
}

export function ImageUpload({
  value = [],
  onChange,
  onImageUpload,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(value || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (onImageUpload) {
          // Use the provided upload function
          const url = await onImageUpload(file);
          if (url) {
            const newPreviews = [...previews, url];
            setPreviews(newPreviews);
            onChange(newPreviews);
          }
        } else {
          // Fallback to local preview
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            if (!previews.includes(result)) {
              const newPreviews = [...previews, result];
              setPreviews(newPreviews);
              onChange(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    onChange(newPreviews);
  };

  return (
    <div>
      {previews.length > 0 ? (
        <div className="space-y-4">
          <ImageCarousel images={previews} />

          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative h-20 w-24 overflow-hidden rounded-md"
              >
                <Image
                  src={preview || "/placeholder.svg"}
                  alt={`Image preview ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-0 top-0 rounded-bl-md bg-black/70 p-1 text-white hover:bg-black/90"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove image</span>
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-20 w-24 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Plus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">Add image</span>
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 flex items-center justify-center gap-2 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              <span className="font-normal">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-normal">Upload featured image(s)</span>
            </>
          )}
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />
    </div>
  );
}
