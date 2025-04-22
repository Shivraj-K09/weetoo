import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { getPosts, getTopViewedPosts } from "@/app/actions/post-actions";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";

export default async function FreeBoard() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch top posts and all posts
  const topPosts = await getTopViewedPosts(6);
  const allPosts = await getPosts();

  // Filter out top posts from all posts to avoid duplication
  const topPostIds = topPosts.map((post) => post.id);
  const regularPosts = allPosts.filter((post) => !topPostIds.includes(post.id));

  const hasNoPosts = topPosts.length === 0 && regularPosts.length === 0;

  return (
    <div className="w-full h-full">
      <div className="flex flex-col w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded object-cover h-[250px]"
        />
      </div>

      <div className="flex justify-between my-5">
        <Button className="bg-[#FF4C4C] text-white rounded-md shadow-none cursor-pointer hover:bg-[#FF4C4C]/[0.9]">
          자유게시판
        </Button>

        {session ? (
          <Button className="shadow-none cursor-pointer" asChild>
            <Link
              href="/free-board/create-post"
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Create Post
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Sign in to Create Post</Link>
          </Button>
        )}
      </div>

      {/* If there are no posts at all, show the empty state */}
      {hasNoPosts ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-medium mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Be the first to share your thoughts, questions, or insights with the
            community.
          </p>
          {session ? (
            <Button size="lg" asChild>
              <Link href="/free-board/create-post">Create the first post</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/login">Sign in to create a post</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Top Posts Grid - Only shown if there are posts */}
          {topPosts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
              {topPosts.map((post) => (
                <Link
                  href={`/free-board/${post.id}`}
                  key={post.id}
                  className="flex items-center gap-4 w-full hover:bg-slate-50 p-2 rounded-md transition-colors"
                >
                  <div className="w-44 h-20 overflow-hidden rounded-md">
                    <Image
                      src={
                        post.featured_images?.[0] ||
                        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt="Post thumbnail"
                      width={176}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-medium">{post.title}</span>
                    <span className="text-sm text-muted-foreground text-justify line-clamp-2">
                      {post.content.replace(/<[^>]*>/g, "")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Separator orientation="horizontal" className="w-full my-5" />

          {/* Posts Table - Only shown if there are posts */}
          <div className="">
            <div className="[&>div]:max-h-[43.75rem] border rounded overflow-hidden">
              <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 text-center font-medium">
                      번호
                    </TableHead>
                    <TableHead className="font-medium">제목</TableHead>
                    <TableHead className="w-24 text-center font-medium">
                      글쓴이
                    </TableHead>
                    <TableHead className="w-24 text-center font-medium">
                      작성일
                    </TableHead>
                    <TableHead className="w-16 text-center font-medium">
                      조회
                    </TableHead>
                    <TableHead className="w-16 text-center font-medium">
                      추천
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regularPosts.length > 0 ? (
                    regularPosts.map((post, index) => (
                      <TableRow key={post.id} className="hover:bg-slate-50">
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/free-board/${post.id}`}
                            className="hover:underline block"
                          >
                            <div className="flex items-center gap-2">
                              {post.featured_images?.length > 0 && (
                                <div className="h-12 w-16 overflow-hidden rounded">
                                  <Image
                                    src={
                                      post.featured_images[0] ||
                                      "/placeholder.svg"
                                    }
                                    alt="Post thumbnail"
                                    width={64}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                  </svg>
                                  {post.category}
                                </Badge>
                                <span>{post.title}</span>
                                {post.tags?.length > 0 && (
                                  <span className="text-gray-500">
                                    [{post.tags.length}]
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{post.user?.first_name || "Anonymous"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          {post.view_count}
                        </TableCell>
                        <TableCell className="text-center">0</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-12 w-12 mb-2 opacity-20" />
                          <p>No posts found in this category</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
