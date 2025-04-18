"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getComments,
  addComment,
  deleteComment,
  updateComment,
  type Comment,
} from "@/app/actions/comment-actions";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function CommentPost({
  postId,
  isLoggedIn,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const router = useRouter();

  // Fetch comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    };

    fetchComments();
  }, [postId]);

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/free-board/" + postId);
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const result = await addComment(postId, newComment);

      if (result.error) {
        console.error("Error adding comment:", result.error);
      } else {
        // Refresh comments
        const updatedComments = await getComments(postId);
        setComments(updatedComments);
        setNewComment("");

        // Show toast notification for points
        toast.success(
          "You earned 50 EXP and 25 KOR Coins for adding a comment!",
          {
            duration: 3000,
            position: "bottom-right",
          }
        );
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId, postId);

      if (result.error) {
        console.error("Error deleting comment:", result.error);
      } else {
        // Remove the comment from the local state
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Handle comment update
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const result = await updateComment(commentId, editContent, postId);

      if (result.error) {
        console.error("Error updating comment:", result.error);
      } else {
        // Update the comment in the local state
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: editContent,
                  updated_at: new Date().toISOString(),
                }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Start editing a comment
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment form */}
      {isLoggedIn ? (
        <div className="mb-10">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 mt-1">
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(currentUserId || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px] resize-none border-gray-300 focus-visible:ring-blue-500 rounded-lg"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
                >
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 bg-blue-50 rounded-lg p-6 text-center">
          <MessageSquare className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-blue-800 mb-2">
            Join the conversation
          </h4>
          <p className="text-blue-600 mb-4 max-w-md mx-auto">
            Sign in to share your thoughts and engage with other readers.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
          >
            <a href={`/login?redirect=/free-board/${postId}`}>
              Sign In to Comment
            </a>
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-8">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-500 mb-1">
              No comments yet
            </h4>
            <p className="text-gray-400">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = currentUserId === comment.user_id;
            const canModify = isAuthor || isAdmin;
            const authorName = comment.user
              ? `${comment.user.first_name || ""} ${comment.user.last_name || ""}`.trim()
              : "Anonymous";

            return (
              <div key={comment.id} className="flex gap-4 group">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage
                    src={comment.user?.avatar_url || ""}
                    alt={authorName}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {authorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                        {comment.created_at !== comment.updated_at && (
                          <span className="ml-2 text-gray-400">(edited)</span>
                        )}
                      </div>
                    </div>

                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Comment options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {isAuthor && (
                            <DropdownMenuItem
                              onClick={() => startEditing(comment)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="mt-2">
                    {editingCommentId === comment.id ? (
                      <div>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px] resize-none border-gray-300 focus-visible:ring-blue-500 rounded-lg"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                            className="rounded-full px-4"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            className="bg-blue-600 hover:bg-blue-700 rounded-full px-4"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
