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
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createServerClient } from "@/lib/supabase/server";
import { getPostsByCategory } from "@/app/actions/post-actions";

export default async function EducationBoard() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch posts with education category
  const educationPosts = await getPostsByCategory("education");

  const hasNoPosts = educationPosts.length === 0;

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
          교육게시판
        </Button>

        {session ? (
          <Button className="shadow-none cursor-pointer" asChild>
            <Link
              href="/education-board/create-post"
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

      <Separator orientation="horizontal" className="w-full my-5" />

      {/* If there are no posts at all, show the empty state */}
      {hasNoPosts ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-medium mb-2">No education posts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Be the first to share your educational content with the community.
          </p>
          {session ? (
            <Button size="lg" asChild>
              <Link href="/education-board/create-post">
                Create the first post
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/login">Sign in to create a post</Link>
            </Button>
          )}
        </div>
      ) : (
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
                {educationPosts.length > 0 ? (
                  educationPosts.map((post, index) => (
                    <TableRow key={post.id} className="hover:bg-slate-50">
                      <TableCell className="text-center">{index + 1}</TableCell>
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
                                className="rounded-full bg-green-100 px-1.5 text-xs text-green-700"
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
                        <p>No education posts found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
