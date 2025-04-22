"use client";

import { useState } from "react";
import CreatePostForm from "@/components/post/create-post-form";
import { PostPreview } from "@/components/post/post-preview";
import { PageHeader } from "@/components/post/page-header";
import { createPost } from "@/app/actions/post-actions";
import { uploadImage } from "@/app/actions/upload-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the PostData type to fix TypeScript errors
interface PostData {
  title: string;
  content: string;
  tags: string[];
  category: string;
  featuredImages: string[];
}

export function CreatePostClient() {
  const router = useRouter();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    tags: [],
    category: "free", // Set default category to "free"
    featuredImages: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add captcha state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Fix TypeScript error by adding proper type
  const updatePostData = (data: Partial<PostData>) => {
    setPostData({ ...postData, ...data });
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
      toast.error("Failed to upload image. Please try again.");
      return null as string | null;
    }
  };

  // Add captcha handlers
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setIsCaptchaVerified(true);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    setIsCaptchaVerified(false);
  };

  // Handle form submission
  const handlePublish = async () => {
    console.log("Publish button clicked");

    // Validate form
    if (!postData.title) {
      toast.error("Title is required");
      return;
    }

    if (!postData.content) {
      toast.error("Content is required");
      return;
    }

    if (!postData.category) {
      toast.error("Category is required");
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    try {
      setIsSaving(true);
      toast.info("Publishing your post...");
      console.log("Submitting post data:", postData);

      // Create FormData object
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("category", postData.category);
      formData.append("tags", JSON.stringify(postData.tags));
      formData.append(
        "featuredImages",
        JSON.stringify(postData.featuredImages)
      );
      formData.append("captchaToken", captchaToken);

      // Submit the form
      console.log("Calling createPost server action");
      const result = await createPost(formData);
      console.log("Server action result:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.success) {
        toast.success(
          result.message || "Your post has been published successfully!"
        );
        setSuccess(result.message);

        // Redirect to free board after a short delay
        setTimeout(() => {
          router.push("/free-board");
        }, 2000);
      } else {
        // If no success or error message, something went wrong
        throw new Error("No response from server");
      }
    } catch (error: any) {
      console.error("Error publishing post:", error);
      setError(error?.message || "Failed to publish post. Please try again.");
      toast.error(
        error?.message || "Failed to publish post. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <PageHeader
          isPreviewMode={isPreviewMode}
          togglePreview={togglePreview}
          onPublish={handlePublish}
          isPublishing={isSaving}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {isPreviewMode ? (
          <PostPreview
            postData={postData}
            onBackToEdit={() => setIsPreviewMode(false)}
          />
        ) : (
          <CreatePostForm
            postData={postData}
            updatePostData={updatePostData}
            onPreview={togglePreview}
            onSave={() => Promise.resolve()}
            onImageUpload={handleImageUpload}
            captchaVerified={isCaptchaVerified}
            onCaptchaVerify={handleCaptchaVerify}
            onCaptchaExpire={handleCaptchaExpire}
          />
        )}
      </div>
    </div>
  );
}
