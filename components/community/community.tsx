"use client";

import { useEffect, useState } from "react";
import { UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { Post } from "@/types";

export function Community() {
  const [activeTab, setActiveTab] = useState("free");
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [profitPosts, setProfitPosts] = useState<Post[]>([]);
  const [educationPosts, setEducationPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);

        // Add cache-busting timestamp to ensure fresh data
        const cacheBuster = new Date().getTime();

        // Fetch free board posts (all categories)
        const { data: freeData, error: freeError } = await supabase
          .from("posts")
          .select(
            `
            id,
            title,
            content,
            user_id,
            category,
            tags,
            featured_images,
            view_count,
            status,
            created_at,
            updated_at,
            user:user_id (
              first_name,
              last_name
            )
          `
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (freeError) {
          console.error("Error fetching free posts:", freeError);
        } else {
          setFreePosts(freeData as unknown as Post[]);
        }

        // Fetch profit board posts (only profit category)
        const { data: profitData, error: profitError } = await supabase
          .from("posts")
          .select(
            `
            id,
            title,
            content,
            user_id,
            category,
            tags,
            featured_images,
            view_count,
            status,
            created_at,
            updated_at,
            user:user_id (
              first_name,
              last_name
            )
          `
          )
          .eq("status", "approved")
          .eq("category", "profit")
          .order("created_at", { ascending: false })
          .limit(10);

        if (profitError) {
          console.error("Error fetching profit posts:", profitError);
        } else {
          setProfitPosts(profitData as unknown as Post[]);
        }

        // Fetch education board posts (only education category)
        const { data: educationData, error: educationError } = await supabase
          .from("posts")
          .select(
            `
            id,
            title,
            content,
            user_id,
            category,
            tags,
            featured_images,
            view_count,
            status,
            created_at,
            updated_at,
            user:user_id (
              first_name,
              last_name
            )
          `
          )
          .eq("status", "approved")
          .eq("category", "education")
          .order("created_at", { ascending: false })
          .limit(10);

        if (educationError) {
          console.error("Error fetching education posts:", educationError);
        } else {
          setEducationPosts(educationData as unknown as Post[]);
        }

        console.log(
          `Community component fetched posts at timestamp: ${cacheBuster}`
        );
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();

    // Set up a polling interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchPosts, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get post URL based on category
  const getPostUrl = (post: Post) => {
    switch (post.category) {
      case "education":
        return `/education-board/${post.id}`;
      case "profit":
        return `/profit-board/${post.id}`;
      default:
        return `/free-board/${post.id}`;
    }
  };

  // Get category label in Korean
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "education":
        return "교육";
      case "profit":
        return "수익";
      case "cryptocurrency":
        return "암호화폐";
      case "trading":
        return "거래";
      case "investment":
        return "투자";
      case "technology":
        return "기술";
      case "news":
        return "뉴스";
      case "analysis":
        return "분석";
      case "tutorial":
        return "튜토리얼";
      default:
        return "자유";
    }
  };

  return (
    <div className="w-full max-w-[1168px] border border-gray-200 rounded-md overflow-hidden bg-white">
      {/* Header with subtle gradient */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-[#e74c3c] via-[#e74c3c]/90 to-[#e74c3c]/80 text-white">
        <UsersIcon className="h-4 w-4 mr-2" />
        <h2 className="text-sm font-medium">WEETOO Community</h2>
      </div>

      {/* Desktop View - Three column layout */}
      <div className="hidden lg:grid md:grid-cols-3 divide-x divide-gray-200">
        {/* Free Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50 flex justify-between">
            <span>Free Board</span>
            <Link href="/free-board" className="text-[#e74c3c] hover:underline">
              More
            </Link>
          </div>
          <div className="h-[220px] overflow-y-auto">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 text-xs border-b border-gray-100 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))
            ) : freePosts.length > 0 ? (
              freePosts.map((post) => (
                <Link href={getPostUrl(post)} key={post.id}>
                  <div className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <span className="text-[#e74c3c] mr-2">
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-gray-700">{post.title}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">
                No posts available
              </div>
            )}
          </div>
        </div>

        {/* Profit Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50 flex justify-between">
            <span>Profit Board</span>
            <Link
              href="/profit-board"
              className="text-[#e74c3c] hover:underline"
            >
              More
            </Link>
          </div>
          <div className="h-[220px] overflow-y-auto">
            {loading ? (
              <div className="animate-pulse p-2 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-video w-full bg-gray-200 rounded"></div>
                  <div className="aspect-video w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : profitPosts.length > 0 &&
              profitPosts.some((post) => post.featured_images?.length > 0) ? (
              <div className="grid grid-cols-2 gap-2 p-2 border-b border-gray-100">
                {profitPosts.slice(0, 2).map((post, index) =>
                  post.featured_images && post.featured_images.length > 0 ? (
                    <Link href={getPostUrl(post)} key={post.id}>
                      <div className="relative rounded overflow-hidden">
                        <div className="aspect-video w-full">
                          <Image
                            src={post.featured_images[0] || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                          <p className="text-white text-[10px] truncate">
                            {post.title}
                          </p>
                          <p className="text-white/70 text-[8px]">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={index}
                      className="relative rounded overflow-hidden"
                    >
                      <div className="aspect-video w-full bg-gray-200"></div>
                    </div>
                  )
                )}
              </div>
            ) : null}

            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 text-xs border-b border-gray-100 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))
            ) : profitPosts.length > 0 ? (
              profitPosts.map((post) => (
                <Link href={getPostUrl(post)} key={post.id}>
                  <div className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <span className="text-[#e74c3c] mr-2">
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-gray-700">{post.title}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">
                No profit posts available
              </div>
            )}
          </div>
        </div>

        {/* Education Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50 flex justify-between">
            <span>Education Board</span>
            <Link
              href="/education-board"
              className="text-[#e74c3c] hover:underline"
            >
              More
            </Link>
          </div>
          <div className="h-[220px] overflow-y-auto">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 text-xs border-b border-gray-100 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))
            ) : educationPosts.length > 0 ? (
              educationPosts.map((post) => (
                <Link href={getPostUrl(post)} key={post.id}>
                  <div className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <span className="text-[#e74c3c] mr-2">
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-gray-700">{post.title}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">
                No education posts available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View - Tab-based layout */}
      <div className="lg:hidden">
        <Tabs
          defaultValue="free"
          value={activeTab}
          onValueChange={setActiveTab}
          className="bg-gray-50"
        >
          <TabsList className="grid grid-cols-3 w-full rounded-none border-b border-gray-200">
            <TabsTrigger
              value="free"
              className="text-xs py-2 px-3 data-[state=active]:bg-white data-[state=active]:text-[#e74c3c] data-[state=active]:border-b-2 data-[state=active]:border-[#e74c3c] data-[state=active]:shadow-none rounded-none"
            >
              <span className="font-medium">자유 게시판</span>
            </TabsTrigger>
            <TabsTrigger
              value="profit"
              className="text-xs py-2 px-3 data-[state=active]:bg-white data-[state=active]:text-[#e74c3c] data-[state=active]:border-b-2 data-[state=active]:border-[#e74c3c] data-[state=active]:shadow-none rounded-none"
            >
              <span className="font-medium">수익 게시판</span>
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="text-xs py-2 px-3 data-[state=active]:bg-white data-[state=active]:text-[#e74c3c] data-[state=active]:border-b-2 data-[state=active]:border-[#e74c3c] data-[state=active]:shadow-none rounded-none"
            >
              <span className="font-medium">교육게시판</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="free" className="m-0 bg-white border-t-0">
            <div className="flex justify-end p-2 border-b border-gray-100">
              <Link
                href="/free-board"
                className="text-xs text-[#e74c3c] hover:underline"
              >
                더보기
              </Link>
            </div>
            <div className="h-[300px] overflow-y-auto">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm border-b border-gray-100 animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
              ) : freePosts.length > 0 ? (
                freePosts.map((post) => (
                  <Link href={getPostUrl(post)} key={post.id}>
                    <div className="px-3 py-2 text-sm border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                      <span className="text-[#e74c3c] mr-2 text-xs font-medium">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-gray-700">{post.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500 text-center">
                  No posts available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profit" className="m-0 bg-white border-t-0">
            <div className="flex justify-end p-2 border-b border-gray-100">
              <Link
                href="/profit-board"
                className="text-xs text-[#e74c3c] hover:underline"
              >
                더보기
              </Link>
            </div>
            {loading ? (
              <div className="animate-pulse p-3 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-video w-full bg-gray-200 rounded-md"></div>
                  <div className="aspect-video w-full bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ) : profitPosts.length > 0 &&
              profitPosts.some((post) => post.featured_images?.length > 0) ? (
              <div className="p-3 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {profitPosts.slice(0, 2).map((post, index) =>
                    post.featured_images && post.featured_images.length > 0 ? (
                      <Link href={getPostUrl(post)} key={post.id}>
                        <div className="relative rounded-md overflow-hidden shadow-sm">
                          <div className="aspect-video w-full">
                            <Image
                              src={
                                post.featured_images[0] || "/placeholder.svg"
                              }
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
                            <p className="text-white text-[10px] truncate">
                              {post.title}
                            </p>
                            <p className="text-white/70 text-[8px]">
                              {formatDate(post.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden shadow-sm"
                      >
                        <div className="aspect-video w-full bg-gray-200"></div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : null}
            <div className="h-[220px] overflow-y-auto">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm border-b border-gray-100 animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
              ) : profitPosts.length > 0 ? (
                profitPosts.map((post) => (
                  <Link href={getPostUrl(post)} key={post.id}>
                    <div className="px-3 py-2 text-sm border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                      <span className="text-[#e74c3c] mr-2 text-xs font-medium">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-gray-700">{post.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500 text-center">
                  No profit posts available
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="education" className="m-0 bg-white border-t-0">
            <div className="flex justify-end p-2 border-b border-gray-100">
              <Link
                href="/education-board"
                className="text-xs text-[#e74c3c] hover:underline"
              >
                더보기
              </Link>
            </div>
            <div className="h-[300px] overflow-y-auto">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm border-b border-gray-100 animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
              ) : educationPosts.length > 0 ? (
                educationPosts.map((post) => (
                  <Link href={getPostUrl(post)} key={post.id}>
                    <div className="px-3 py-2 text-sm border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                      <span className="text-[#e74c3c] mr-2 text-xs font-medium">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-gray-700">{post.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500 text-center">
                  No education posts available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
