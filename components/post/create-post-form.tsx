"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "./tiptap-editor";
import { TagInput } from "./tag-input";
import { ImageUpload } from "./image-upload";
import { CaptchaWrapper } from "../captcha-wrapper";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Save } from "lucide-react";
import { toast } from "sonner";

interface PostData {
  title: string;
  content: string;
  tags: string[];
  category: string;
  featuredImages: string[];
}

interface CreatePostFormProps {
  postData: PostData;
  updatePostData: (data: Partial<PostData>) => void;
  onPreview: () => void;
  onSave?: (content: string) => Promise<void>;
  onImageUpload?: (file: File) => Promise<string | null>;
  onCaptchaVerify?: (token: string) => void;
  onCaptchaExpire?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  isPreviewMode?: boolean;
  isEditing?: boolean;
  boardType?: string;
  recaptchaToken?: string | null;
}

export function CreatePostForm({
  postData,
  updatePostData,
  onPreview,
  onSave,
  onImageUpload,
  onCaptchaVerify,
  onCaptchaExpire,
  onPublish,
  isPublishing = false,
  isPreviewMode = false,
  isEditing = false,
  boardType = "free-board",
  recaptchaToken,
}: CreatePostFormProps) {
  const router = useRouter();
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Handle reCAPTCHA verification
  const handleRecaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setIsRecaptchaReady(true);
    if (onCaptchaVerify) {
      onCaptchaVerify(token);
    }
  };

  // Handle reCAPTCHA expiration
  const handleRecaptchaExpire = () => {
    setCaptchaToken(null);
    setIsRecaptchaReady(false);
    if (onCaptchaExpire) {
      onCaptchaExpire();
    }
  };

  // Monitor recaptchaToken changes from props
  useEffect(() => {
    if (recaptchaToken) {
      setCaptchaToken(recaptchaToken);
      setIsRecaptchaReady(true);
    }
  }, [recaptchaToken]);

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!captchaToken && !recaptchaToken) {
      toast.error("Please wait a moment while we verify your request");
      return;
    }

    console.log("Publish/Update button clicked in CreatePostForm");
    if (onPublish) {
      onPublish();
    } else if (onSave) {
      onSave(postData.content);
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
      {/* Title Section */}
      <div className="space-y-2">
        <Input
          id="title"
          placeholder="Enter post title"
          value={postData.title}
          onChange={(e) => updatePostData({ title: e.target.value })}
          className="text-2xl font-medium border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>

      <Separator />

      {/* Category is removed from UI but still stored in postData */}

      {/* Featured Image Section */}
      <div className="space-y-2">
        <Label htmlFor="featured-image" className="text-sm font-medium">
          Featured Images
        </Label>
        <ImageUpload
          value={postData.featuredImages}
          onChange={(images) => updatePostData({ featuredImages: images })}
          onImageUpload={onImageUpload}
        />
        <p className="text-xs text-muted-foreground">
          Upload one or more images for your post
        </p>
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <TagInput
          value={postData.tags}
          onChange={(tags) => updatePostData({ tags })}
        />
        <p className="text-xs text-muted-foreground">
          Add relevant tags to help readers find your post
        </p>
      </div>

      <Separator />

      {/* Content Section */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          Content
        </Label>
        <TiptapEditor
          content={postData.content}
          onChange={(content) => updatePostData({ content })}
          onSave={onSave}
        />
      </div>

      {/* Invisible reCAPTCHA */}
      <div className="mt-6">
        <CaptchaWrapper
          onVerify={handleRecaptchaVerify}
          onExpire={handleRecaptchaExpire}
          action="create_post"
        />
      </div>

      {/* Action Buttons - Bottom section with all four buttons, styled like PageHeader */}
      <div className="flex justify-center gap-3 pt-6">
        <Button variant="outline" asChild>
          <Link href={`/${boardType}`}>Cancel</Link>
        </Button>

        <Button variant="outline" type="button">
          Save as Draft
        </Button>

        {!isPreviewMode && (
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}

        <Button
          className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/90"
          onClick={handlePublishClick}
          disabled={
            isPublishing ||
            (!isRecaptchaReady && !captchaToken && !recaptchaToken)
          }
          type="button"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isPublishing ? "Saving..." : "Save Changes"}
            </>
          ) : isPublishing ? (
            "Publishing..."
          ) : !isRecaptchaReady && !captchaToken && !recaptchaToken ? (
            "Verifying..."
          ) : (
            "Publish"
          )}
        </Button>
      </div>
    </div>
  );
}
