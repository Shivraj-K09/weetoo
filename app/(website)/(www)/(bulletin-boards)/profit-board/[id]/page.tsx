import { getPost } from "@/app/actions/post-actions";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Eye, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";
import { ImageCarousel } from "@/components/post/image-carousel";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ViewCounter from "../../free-board/[id]/view-count"; // Reuse from free-board
import { getPostLikeCount, hasUserLikedPost } from "@/app/actions/like-actions";
import { DeletePostDialog } from "../../free-board/[id]/delete-post"; // Reuse from free-board
import { CommentPost } from "../../free-board/[id]/comment-post"; // Reuse from free-board
import { getCommentCount } from "@/app/actions/comment-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareDialog } from "../../free-board/[id]/share-dialog"; // Reuse from free-board
import { getShareCount, getRecentShares } from "@/app/actions/share-actions";
import { LikeButton } from "../../free-board/[id]/like-button";
import { unstable_noStore } from "next/cache";

export default async function ProfitPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  unstable_noStore();

  // Ensure params is properly handled
  const { id } = await params;

  // Now use the extracted id
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if current user is the author
  const isAuthor = session?.user?.id === post.user_id;

  // Get user role to check if admin
  let isAdmin = false;
  if (session) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();
    isAdmin = userData?.role === "admin" || userData?.role === "super_admin";
  }

  // Get like count and check if user has liked
  const likeCount = await getPostLikeCount(id);
  const hasLiked = session ? await hasUserLikedPost(id) : false;

  // Get comment count
  const commentCount = await getCommentCount(id);

  // Get share count and recent shares
  const shareCount = await getShareCount(id);
  const recentShares = await getRecentShares(id, 5);

  // Format date
  const formattedDate = format(new Date(post.created_at), "MMMM d, yyyy");

  // Get author name
  const authorName = post.user
    ? `${post.user.first_name || ""} ${post.user.last_name || ""}`.trim()
    : "Anonymous";

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || name === "Anonymous") return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="mx-auto border rounded-lg p-6">
      <div className="mb-8">
        <Link
          href="/profit-board"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profit Board
        </Link>
      </div>

      <article className="space-y-8">
        {/* Post Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
              {post.category}
            </Badge>
            {post.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-gray-600 border-gray-300 bg-transparent"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src={post.user?.avatar_url || ""} alt={authorName} />
              <AvatarFallback className="bg-green-100 text-green-800">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="font-medium text-gray-900">{authorName}</div>
              <div className="text-sm text-gray-500">{formattedDate}</div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.view_count}</span>
                <ViewCounter postId={post.id} />
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Images */}
        {post.featured_images?.length > 0 && (
          <div className="rounded-xl overflow-hidden">
            <ImageCarousel images={post.featured_images} />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Post Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <LikeButton
              postId={id}
              initialLikeCount={likeCount}
              initialLiked={hasLiked}
              isLoggedIn={!!session}
              isAuthor={isAuthor}
            />

            <ShareDialog
              postId={id}
              postTitle={post.title}
              isLoggedIn={!!session}
              recentShares={recentShares}
            />

            {shareCount > 0 && (
              <span className="text-sm text-gray-500 ml-1">
                {shareCount} shares
              </span>
            )}
          </div>

          {isAuthor && (
            <div className="flex items-center">
              <DeletePostDialog postId={post.id} />
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <CommentPost
          postId={post.id}
          isLoggedIn={!!session}
          currentUserId={session?.user?.id}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
