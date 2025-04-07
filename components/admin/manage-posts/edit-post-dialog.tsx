"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "./post-management-table";

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedPost: Post) => void;
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onUpdate,
}: EditPostDialogProps) {
  const [formData, setFormData] = useState({
    title: post.title,
    category: post.category,
    situation: post.situation,
    content: `The cryptocurrency market has seen significant changes in 2024. This article explores the key trends that are shaping the market this year.

Market capitalization has increased by 25% since January, with major cryptocurrencies leading the charge.

More financial institutions are entering the cryptocurrency space, providing legitimacy and stability to the market.

New regulations are being implemented globally, creating a more structured environment for cryptocurrency trading.

Advancements in blockchain technology continue to drive the evolution of cryptocurrencies and their applications.

Understanding these trends is essential for anyone involved in cryptocurrency investments or trading in 2024.`,
    seoTitle: post.title,
    seoDescription:
      "Explore the latest cryptocurrency market trends in 2024 and understand how they impact your investments.",
    tags: "cryptocurrency, market trends, 2024, investing, blockchain",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create updated post object
    const updatedPost: Post = {
      ...post,
      title: formData.title,
      category: formData.category,
      situation: formData.situation,
    };

    onUpdate(updatedPost);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-background pb-4 border-b">
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to the post. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4 flex-1 overflow-y-auto"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                className="shadow-none cursor-pointer h-10"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger
                    id="category"
                    className="w-full h-10 shadow-none cursor-pointer"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cryptocurrency">
                      Cryptocurrency
                    </SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="situation">Status</Label>
                <Select
                  value={formData.situation}
                  onValueChange={(value) =>
                    handleSelectChange("situation", value)
                  }
                >
                  <SelectTrigger
                    id="situation"
                    className="w-full h-10 shadow-none cursor-pointer"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="min-h-[200px] shadow-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                className="shadow-none h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                className="min-h-[80px] shadow-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="shadow-none h-10"
              />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 z-10 bg-background pt-4 border-t mt-auto">
            <Button
              type="button"
              variant="outline"
              className="shadow-none h-10 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="shadow-none h-10 cursor-pointer">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
