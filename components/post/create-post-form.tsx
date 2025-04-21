"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "./tiptap-editor";
import { TagInput } from "./tag-input";
import { ImageUpload } from "./image-upload";
import { CaptchaWrapper } from "../captcha-wrapper";
import { useState } from "react";

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
  captchaVerified?: boolean;
  onCaptchaVerify?: (token: string) => void;
  onCaptchaExpire?: () => void;
}

export default function CreatePostForm({
  postData,
  updatePostData,
  onPreview,
  onSave,
  onImageUpload,
  onCaptchaVerify,
  onCaptchaExpire,
}: CreatePostFormProps) {
  const [captchaToken, setCaptchaToken] = useState<string>("");

  // Add a function to handle CAPTCHA verification
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  // Add a function to handle CAPTCHA expiration
  const handleCaptchaExpire = () => {
    setCaptchaToken("");
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
          className="!text-2xl font-medium border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none"
        />
      </div>

      <Separator />

      {/* Category Section */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <Select
          value={postData.category}
          onValueChange={(value) => updatePostData({ category: value })}
        >
          <SelectTrigger
            id="category"
            className="w-full shadow-none h-10 cursor-pointer"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
            <SelectItem value="trading">Trading</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Captcha Section */}
      <div className="mt-6">
        <CaptchaWrapper
          onVerify={(token) => onCaptchaVerify?.(token)}
          onExpire={() => onCaptchaExpire?.()}
        />
      </div>

      {/* Action Buttons - Only showing Save as Draft since Preview is moved to header */}
      <div className="flex justify-end pt-2">
        <Button variant="outline" type="button">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
