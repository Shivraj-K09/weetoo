"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Eye, Save } from "lucide-react";

interface PageHeaderProps {
  isPreviewMode: boolean;
  togglePreview: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  isEditing?: boolean;
}

export function PageHeader({
  isPreviewMode,
  togglePreview,
  onPublish,
  isPublishing = false,
  isEditing = false,
}: PageHeaderProps) {
  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Publish/Update button clicked in PageHeader");
    if (onPublish) {
      onPublish();
    }
  };

  return (
    <div className="mb-8">
      {/* Back link in its own row */}
      <div className="mb-4">
        <Link
          href="/free-board"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Board
        </Link>
      </div>

      {/* Title and action buttons in separate row with proper spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">
          {isEditing
            ? isPreviewMode
              ? "Post Preview"
              : "Edit Post"
            : isPreviewMode
              ? "Post Preview"
              : "Create Post"}
        </h1>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/free-board">Cancel</Link>
          </Button>

          {!isPreviewMode && (
            <Button variant="outline" onClick={togglePreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          )}

          <Button
            className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/90"
            onClick={handlePublishClick}
            disabled={isPublishing}
            type="button"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isPublishing ? "Saving..." : "Save Changes"}
              </>
            ) : isPublishing ? (
              "Publishing..."
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
