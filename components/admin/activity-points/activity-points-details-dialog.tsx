"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  FileText,
  Award,
  Link,
  MessageSquare,
  ThumbsUp,
  Share2,
} from "lucide-react";
import type { ActivityPoint } from "./activity-points-table";

interface ActivityPointsDetailsDialogProps {
  activity: ActivityPoint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityPointsDetailsDialog({
  activity,
  open,
  onOpenChange,
}: ActivityPointsDetailsDialogProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Get activity type badge color
  const getActivityTypeBadgeClass = (activityType: string) => {
    switch (activityType) {
      case "post":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
      case "comment":
        return "bg-green-50 text-green-700 dark:bg-green-900/20";
      case "like":
        return "bg-pink-50 text-pink-700 dark:bg-pink-900/20";
      case "share":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20";
      case "login":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20";
      case "referral":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20";
      case "content":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20";
      case "checkin":
        return "bg-teal-50 text-teal-700 dark:bg-teal-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  };

  // Get activity type icon
  const getActivityTypeIcon = (activityType: string) => {
    switch (activityType) {
      case "post":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "like":
        return <ThumbsUp className="h-5 w-5 text-pink-500" />;
      case "share":
        return <Share2 className="h-5 w-5 text-purple-500" />;
      case "login":
        return <User className="h-5 w-5 text-yellow-500" />;
      case "referral":
        return <Link className="h-5 w-5 text-orange-500" />;
      case "content":
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case "checkin":
        return <Calendar className="h-5 w-5 text-teal-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  // Mock additional activity data
  const additionalActivityData = {
    relatedContent:
      activity.activityType === "post" || activity.activityType === "content"
        ? {
            title: "How to maximize your cryptocurrency investments in 2024",
            url: "/posts/crypto-investments-2024",
            views: 1245,
            likes: 87,
            comments: 32,
          }
        : activity.activityType === "comment"
        ? {
            commentOn:
              "How to maximize your cryptocurrency investments in 2024",
            commentUrl: "/posts/crypto-investments-2024#comment-123",
            commentText:
              "This is a really insightful analysis. I particularly appreciate the section on risk management.",
          }
        : activity.activityType === "like"
        ? {
            likedContent:
              "How to maximize your cryptocurrency investments in 2024",
            likedContentUrl: "/posts/crypto-investments-2024",
          }
        : activity.activityType === "share"
        ? {
            sharedContent:
              "How to maximize your cryptocurrency investments in 2024",
            sharedContentUrl: "/posts/crypto-investments-2024",
            sharedTo: "Twitter",
          }
        : activity.activityType === "referral"
        ? {
            referredUser: "Bae Suzy",
            referredUserUid: "UID-24060507",
            referralDate: "2024-06-27T13:00:00",
          }
        : null,
    userStats: {
      totalPoints: 1250,
      pointsThisMonth: 350,
      activityRank: "Gold",
      mostFrequentActivity: "Post Creation",
    },
    pointsHistory: [
      {
        date: "2024-06-25",
        points: 120,
      },
      {
        date: "2024-06-26",
        points: 85,
      },
      {
        date: "2024-06-27",
        points: 45,
      },
      {
        date: "2024-06-28",
        points: 50,
      },
      {
        date: "2024-06-29",
        points: 30,
      },
      {
        date: "2024-06-30",
        points: 20,
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            Activity Points Details
            <Badge
              variant="outline"
              className={getActivityTypeBadgeClass(activity.activityType)}
            >
              {activity.activityTypeLabel}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Activity ID: <span className="font-mono">{activity.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* User Information */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={activity.user.avatar}
                alt={activity.user.name}
              />
              <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{activity.user.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {activity.user.uid}
              </p>
            </div>
          </div>

          <Separator />

          {/* Activity Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Points Earned</p>
                <p className="text-lg font-semibold">
                  {activity.points} points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p>{formatDate(activity.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {getActivityTypeIcon(activity.activityType)}
              <div>
                <p className="text-sm font-medium">Activity Type</p>
                <p>{activity.activityTypeLabel}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Content</p>
                <p className="text-sm">{activity.content}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Related Content (if any) */}
          {additionalActivityData.relatedContent && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Related Content</h4>
              <div className="bg-muted/50 p-4 rounded-md">
                {activity.activityType === "post" ||
                activity.activityType === "content" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Post Title</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.title}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">URL</span>
                      <span className="text-sm font-mono">
                        {additionalActivityData.relatedContent.url}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Views</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.views}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Likes</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.likes}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Comments</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.comments}
                      </span>
                    </div>
                  </>
                ) : activity.activityType === "comment" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Commented On</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.commentOn}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Comment URL</span>
                      <span className="text-sm font-mono">
                        {additionalActivityData.relatedContent.commentUrl}
                      </span>
                    </div>
                    <div className="py-2">
                      <span className="text-sm font-medium block mb-1">
                        Comment Text
                      </span>
                      <p className="text-sm bg-background p-2 rounded-md">
                        {additionalActivityData.relatedContent.commentText}
                      </p>
                    </div>
                  </>
                ) : activity.activityType === "like" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Liked Content</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.likedContent}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Content URL</span>
                      <span className="text-sm font-mono">
                        {additionalActivityData.relatedContent.likedContentUrl}
                      </span>
                    </div>
                  </>
                ) : activity.activityType === "share" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">
                        Shared Content
                      </span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.sharedContent}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Content URL</span>
                      <span className="text-sm font-mono">
                        {additionalActivityData.relatedContent.sharedContentUrl}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Shared To</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.sharedTo}
                      </span>
                    </div>
                  </>
                ) : activity.activityType === "referral" ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">Referred User</span>
                      <span className="text-sm">
                        {additionalActivityData.relatedContent.referredUser}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">User UID</span>
                      <span className="text-sm font-mono">
                        {additionalActivityData.relatedContent.referredUserUid}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Referral Date</span>
                      <span className="text-sm">
                        {formatDate(
                          additionalActivityData.relatedContent.referralDate ||
                            ""
                        )}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* User Points Stats */}
          <div>
            <h4 className="text-sm font-semibold mb-3">
              User Points Statistics
            </h4>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Total Points</span>
                <span className="text-sm font-semibold">
                  {additionalActivityData.userStats.totalPoints} points
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Points This Month</span>
                <span className="text-sm">
                  {additionalActivityData.userStats.pointsThisMonth} points
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Activity Rank</span>
                <span className="text-sm">
                  {additionalActivityData.userStats.activityRank}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">
                  Most Frequent Activity
                </span>
                <span className="text-sm">
                  {additionalActivityData.userStats.mostFrequentActivity}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Points History */}
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Recent Points History
            </h4>
            <div className="space-y-2">
              {additionalActivityData.pointsHistory.map((history, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-muted/30 p-2 rounded-md"
                >
                  <span className="text-sm">{history.date}</span>
                  <span className="text-sm font-medium">
                    {history.points} points
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 bg-background pt-4 border-t mt-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="shadow-none h-10 cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
