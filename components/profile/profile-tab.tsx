"use client";

import { useState, useEffect } from "react";
import { Edit, Camera, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useUserStore, useUserActions } from "@/lib/store/user-store";
import { NicknameChangeDialog } from "./nickname-change-dialog";
import { NICKNAME_CHANGE_COST } from "./profile-data";

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [hasChangedNickname, setHasChangedNickname] = useState(false);
  const [nicknameChangeDialogOpen, setNicknameChangeDialogOpen] =
    useState(false);

  // Get user data and actions from the store
  const { user, profile, isLoading } = useUserStore();
  const { updateProfile } = useUserActions();

  useEffect(() => {
    if (profile) {
      setEditedNickname(
        profile.nickname || profile?.email?.split("@")[0] || "user"
      );
      setEditedFirstName(profile.first_name || "");
      setEditedLastName(profile.last_name || "");

      // Check if user has already changed their nickname
      setHasChangedNickname(
        !!profile.nickname && profile.nickname !== profile?.email?.split("@")[0]
      );
    }
  }, [profile]);

  // Helper function to check if user is using social login
  const isSocialLogin = () => {
    return (
      user?.app_metadata?.provider ||
      (user?.identities &&
        user.identities.length > 0 &&
        ["google", "kakao", "naver"].includes(
          user.identities[0].provider.toLowerCase()
        ))
    );
  };

  // Function to handle saving profile updates
  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    try {
      // Use the updateProfile action from the store
      await updateProfile({
        first_name: editedFirstName,
        last_name: editedLastName,
      });

      // Exit edit mode
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    }
  };

  // Function to handle canceling edits
  const handleCancelEdit = () => {
    if (profile) {
      // Reset to original values
      setEditedNickname(
        profile.nickname || profile?.email?.split("@")[0] || "user"
      );
      setEditedFirstName(profile.first_name || "");
      setEditedLastName(profile.last_name || "");
    }
    setIsEditing(false);
  };

  // Function to open nickname change dialog
  const openNicknameChangeDialog = () => {
    setNicknameChangeDialogOpen(true);
  };

  return (
    <div className="p-0">
      <div className="p-6 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 mb-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center">
            <div className="relative group mb-3 cursor-pointer">
              {isLoading ? (
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                  <AvatarImage
                    src={
                      profile?.avatar_url ||
                      "/placeholder.svg?height=96&width=96" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={`${profile?.first_name || "User"}'s Profile`}
                  />
                  <AvatarFallback className="bg-[#F8F9FA] text-[#495057] text-xl font-medium">
                    {profile
                      ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <button
                className="absolute bottom-0 right-0 bg-white text-[#E63946] rounded-full p-1.5 shadow-sm
                          opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                권장크기: 100x100px
              </div>
              <div className="text-xs text-gray-500">
                문제적 이미지 업로드 금지
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-[#E63946] hover:text-[#E63946] hover:bg-[#E63946]/5 px-2"
              >
                edit
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3 border-gray-200 text-gray-700"
              >
                이미지 업로드
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3 border-gray-200 text-gray-600"
              >
                삭제
              </Button>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="space-y-5 bg-[#F8F9FA] rounded-lg p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-800">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                  )}
                </div>
                {isLoading ? (
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    @
                    {profile?.nickname ||
                      profile?.email?.split("@")[0] ||
                      "user"}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer flex items-center gap-1 text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946]/5 hover:text-[#E63946] hover:border-[#E63946]/30"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-3 w-3" />
                {isEditing ? "취소" : "편집"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-2">
              <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                닉네임
              </div>
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                ) : isEditing ? (
                  <div className="flex flex-col gap-1 w-full max-w-[400px]">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-800">
                        {profile?.nickname ||
                          profile?.email?.split("@")[0] ||
                          "user"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2 border-[#E63946]/20 text-[#E63946] hover:bg-[#E63946]/5"
                        onClick={openNicknameChangeDialog}
                      >
                        변경
                      </Button>
                    </div>
                    {hasChangedNickname && (
                      <p className="text-xs text-amber-500">
                        Nickname changes cost{" "}
                        {NICKNAME_CHANGE_COST.toLocaleString()} kor_coins.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="font-medium text-gray-800">
                    {profile?.nickname ||
                      profile?.email?.split("@")[0] ||
                      "user"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
              <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                이름
              </div>
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      placeholder="First name"
                      className="max-w-[150px] h-9 bg-white border-gray-200"
                    />
                    <Input
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      placeholder="Last name"
                      className="max-w-[150px] h-9 bg-white border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="font-medium text-gray-800">
                    {profile?.first_name} {profile?.last_name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
              <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                e-mail
              </div>
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    {profile?.email || user?.email || ""}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
              <div className="text-sm font-medium text-gray-500 w-32 mb-2 sm:mb-0">
                비밀번호
              </div>
              {isLoading ? (
                <div className="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-3">
                  {isSocialLogin() ? (
                    <div className="text-sm text-gray-600">
                      You are logged in with a social account. Password
                      management is not available.
                    </div>
                  ) : (
                    <>
                      <Input
                        type="password"
                        value="********"
                        className="max-w-[200px] h-9 bg-white border-gray-200"
                        readOnly
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-[#E63946] hover:text-[#E63946] hover:bg-[#E63946]/5 px-3"
                      >
                        변경
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons with Animation */}
      <motion.div
        className="bg-[#F8F9FA] p-5 flex justify-end gap-3 border-t border-gray-200 mt-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="px-5 py-2 h-10 text-gray-700 border-gray-300 font-medium cursor-pointer"
            onClick={handleCancelEdit}
          >
            취소
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="sm"
            className="px-5 py-2 h-10 bg-[#E63946] hover:bg-[#D62C39] flex items-center gap-1 font-medium cursor-pointer"
            disabled={isLoading}
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                로딩중...
              </div>
            ) : (
              <>
                {isEditing ? "저장" : "편집"}
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    duration: 1.5,
                    ease: "easeInOut",
                    repeatDelay: 0.5,
                  }}
                >
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </motion.div>
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Nickname Change Dialog */}
      <NicknameChangeDialog
        open={nicknameChangeDialogOpen}
        onOpenChange={setNicknameChangeDialogOpen}
        currentNickname={editedNickname}
        onNicknameChanged={(newNickname) => setEditedNickname(newNickname)}
      />
    </div>
  );
}
