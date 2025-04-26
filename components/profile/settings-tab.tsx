"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { platforms } from "./profile-data";

export function SettingsTab() {
  const [uidDialogOpen, setUidDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [uidInput, setUidInput] = useState("");

  const openUidDialog = (platformId: string) => {
    setCurrentPlatform(platformId);
    setUidDialogOpen(true);
  };

  return (
    <div className="p-0">
      {/* UID Registration Header */}
      <div className="bg-[#F8F9FA] border-b border-gray-200 p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#E63946]" />
          <h2 className="text-lg font-medium text-gray-800">UID 등록</h2>
        </div>
      </div>

      {/* UID Registration List */}
      <div className="p-0">
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-[100px_1fr_auto] items-center p-4 bg-[#F8F9FA]">
            <div className="text-sm font-medium text-gray-700">UID</div>
            <div className="text-sm font-medium"></div>
            <div className="text-sm font-medium"></div>
          </div>
        </div>

        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => !platform.disabled && openUidDialog(platform.id)}
          >
            <div className="grid grid-cols-[100px_1fr_auto] items-center p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl" style={{ color: platform.color }}>
                  {platform.logo}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {platform.name}
                </span>
              </div>
              <div className="text-xs text-blue-600 cursor-pointer">
                {platform.status}
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-[#E63946] hover:bg-[#D62C39] text-white"
                disabled={platform.disabled}
              >
                등록하기
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* UID Registration Dialog */}
      <Dialog open={uidDialogOpen} onOpenChange={setUidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {platforms.find((p) => p.id === currentPlatform)?.name} UID
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="uid" className="text-sm font-medium">
                UID
              </label>
              <Input
                id="uid"
                placeholder="UID 입력"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
                className="focus-visible:ring-[#E63946]"
              />
            </div>

            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
              <p>※회원 아이디(이메일) 정보와 수수료 100% 페이백</p>
              <p>※회원 아이디(이메일) 가입시만 신청이 완료됩니다.</p>
              <p>※24시간 내 완료됩니다. (영업일 기준)</p>
              <p>※타인 아이디(이메일) 기재 시는 신청이 불가합니다.</p>
              <p>
                ※기존 HASHKEY 회원의 경우 등 계약에서만 페이백을 받으실 수
                있습니다.
              </p>
              <div className="flex items-center gap-2 mt-2 text-blue-600 cursor-pointer">
                <span
                  className="text-xl"
                  style={{
                    color: platforms.find((p) => p.id === currentPlatform)
                      ?.color,
                  }}
                >
                  {platforms.find((p) => p.id === currentPlatform)?.logo}
                </span>
                <span>
                  HASHKEY - 코리아 페이백(수수료 거래액의 가상화폐) [클릭]
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setUidDialogOpen(false)}
            >
              닫기
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#E63946] hover:bg-[#D62C39] text-white"
              onClick={() => setUidDialogOpen(false)}
            >
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
