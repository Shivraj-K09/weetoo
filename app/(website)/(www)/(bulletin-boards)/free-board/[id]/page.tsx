import { getPost } from "@/app/actions/post-actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User, Eye, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { ImageCarousel } from "@/components/post/image-carousel";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import ViewCounter from "./view-count";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params promise and destructure id
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/free-board"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Board
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-sm overflow-hidden">
        <header className="p-6 border-b">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 rounded-md"
            >
              {post.category}
            </Badge>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-md">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{post.user?.first_name || "Anonymous"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span title={format(new Date(post.created_at), "PPP")}>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.view_count} views</span>
              {/* Hidden component to increment view count */}
              <ViewCounter postId={post.id} />
            </div>
          </div>
        </header>

        {post.featured_images?.length > 0 && (
          <div className="p-6 border-b">
            <ImageCarousel images={post.featured_images} />
          </div>
        )}

        <div className="p-6">
          <div
            className="prose prose-sm sm:prose-base max-w-none post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <footer className="p-6 border-t bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>Like</span>
            </Button>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" asChild>
                <Link href={`/free-board/edit/${post.id}`}>Edit</Link>
              </Button> */}
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}
