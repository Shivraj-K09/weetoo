"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { ImageCarousel } from "./image-carousel";

interface PostPreviewProps {
  postData: {
    title: string;
    content: string;
    tags: string[];
    category: string;
    featuredImages: string[];
  };
  onBackToEdit: () => void;
}

export function PostPreview({ postData, onBackToEdit }: PostPreviewProps) {
  const { title, content, tags, category, featuredImages } = postData;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 p-3 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToEdit}
          className="text-neutral-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to editing
        </Button>
        <div className="text-sm text-neutral-500">Preview Mode</div>
      </div>

      <article className="max-w-4xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-4">
            {title || "Untitled Post"}
          </h1>

          <div className="flex flex-wrap gap-3 mb-4">
            {category && (
              <Badge
                variant="secondary"
                className="text-xs bg-neutral-100 text-neutral-800 rounded-md"
              >
                {category}
              </Badge>
            )}
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs rounded-md">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>Author Name</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{currentDate}</span>
            </div>
          </div>

          {featuredImages.length > 0 && (
            <div className="mb-6">
              <ImageCarousel images={featuredImages} />
            </div>
          )}
        </header>

        <div
          className="prose prose-neutral prose-sm sm:prose-base max-w-none post-content"
          dangerouslySetInnerHTML={{
            __html:
              content ||
              "<p>No content yet. Add some content to see the preview.</p>",
          }}
        />
      </article>
    </div>
  );
}
