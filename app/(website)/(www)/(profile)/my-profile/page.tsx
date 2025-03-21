"use client";

import { useState } from "react";
import {
  User,
  MessageCircle,
  Award,
  Settings,
  Edit,
  Camera,
  ArrowRight,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [messageTab, setMessageTab] = useState("received");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [uidDialogOpen, setUidDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState("");
  const [uidInput, setUidInput] = useState("");

  // Sample message data
  const messages = [
    {
      id: "1",
      status: "unread",
      type: "normal",
      sender: "피터팬의 좋은날",
      title: "안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다.",
      date: "25-01-22",
      time: "16:12",
    },
    {
      id: "2",
      status: "unread",
      type: "normal",
      sender: "피터팬의 좋은날",
      title: "안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다.",
      date: "25-01-20",
      time: "10:58",
    },
    {
      id: "3",
      status: "unread",
      type: "important",
      sender: "피터팬의 좋은날",
      title:
        "🔶 긴급 무료 특강 🔶 오늘 밤 3시에 진행될 무료 특강 안내드립니다. 자세한 내용은 아래를 참고해주세요.",
      date: "25-01-20",
      time: "12:34",
    },
    {
      id: "4",
      status: "read",
      type: "normal",
      sender: "피터팬의 좋은날",
      title:
        "(AD) ◆ 관심있다면, 선착순으로 알려드립니다. ◆ 오늘 밤 끝이 1개월이 마감됩니다.",
      date: "25-01-17",
      time: "18:00",
    },
    {
      id: "5",
      status: "read",
      type: "normal",
      sender: "피터팬의 좋은날",
      title:
        "안녕하세요, 피터팬을 응원해 주셔서 감사합니다. 내일 1/18(목) 낮 2시! [잠 들에 4일 특가]하고 싶은 분들 모여라~",
      date: "25-01-17",
      time: "11:47",
    },
    {
      id: "6",
      status: "read",
      type: "normal",
      sender: "피터팬의 좋은날",
      title:
        "안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다. ------------------------ [1/16]",
      date: "25-01-16",
      time: "16:17",
    },
    {
      id: "7",
      status: "read",
      type: "ad",
      sender: "피터팬의 좋은날",
      title:
        "(AD)<이벤한샷 통인천 베이트볼트> 상담문의: 010-9094-1705 ■ 홈페이지: https://ima400...",
      date: "25-01-16",
      time: "10:36",
    },
    {
      id: "8",
      status: "read",
      type: "normal",
      sender: "증권나라",
      title:
        "(광고) 고통가 시대... ※SKB 299만 확*% 발굴 극비! 인천넷+IPTV 신규가입 이벤트, 온국 B...",
      date: "25-01-16",
      time: "10:32",
    },
    {
      id: "9",
      status: "read",
      type: "ad",
      sender: "피터팬의 좋은날",
      title:
        "(AD)<이벤한샷 통인천 베이트볼트> 상담문의: 010-9094-1705 ■ 홈페이지: https://ima400...",
      date: "25-01-15",
      time: "11:01",
    },
    {
      id: "10",
      status: "read",
      type: "normal",
      sender: "피터팬의 좋은날",
      title:
        "안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다. ------------------------ [1/14]",
      date: "25-01-14",
      time: "11:43",
    },
  ];

  // Sample points data
  const pointsData = {
    totalPoints: 6980000,
    availablePoints: 1680000,
    transactions: [
      {
        id: "1",
        type: "적립",
        description: "소식사항",
        amount: 1000,
        date: "2025-01-22",
      },
      {
        id: "2",
        type: "적립",
        description: "방문사항",
        amount: 500,
        date: "2025-01-20",
      },
      {
        id: "3",
        type: "출금",
        description: "출금신청",
        amount: -50000,
        date: "2025-01-15",
      },
      {
        id: "4",
        type: "적립",
        description: "소식사항",
        amount: 1000,
        date: "2025-01-10",
      },
    ],
  };

  // Sample UID platforms data
  const platforms = [
    {
      id: "bitget",
      name: "BITGET",
      logo: "🔵",
      color: "#1E88E5",
      status: "수수료 83% 페이백, 등 방생 수수료 50% 페이백 [클릭]",
      registered: false,
    },
    {
      id: "gate",
      name: "GATE.IO",
      logo: "🔷",
      color: "#2979FF",
      status: "수수료 100% 페이백, 등 방생 수수료 85% 페이백 [클릭]",
      registered: false,
    },
    {
      id: "hashkey",
      name: "HASHKEY",
      logo: "🟪",
      color: "#9C27B0",
      status: "수수료 100% 페이백 [클릭]",
      registered: false,
    },
    {
      id: "mexc",
      name: "MEXC",
      logo: "🟦",
      color: "#0288D1",
      status: "현재 등록 불가능",
      registered: false,
      disabled: true,
    },
  ];

  const toggleSelectMessage = (id: string) => {
    setSelectedMessages((prev) =>
      prev.includes(id)
        ? prev.filter((messageId) => messageId !== id)
        : [...prev, id]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg.id));
    }
  };

  const getMessageIcon = (type: string, status: string) => {
    if (type === "important")
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    if (type === "ad")
      return (
        <Badge
          variant="outline"
          className="h-5 px-1 text-xs bg-blue-50 text-blue-600 border-blue-100"
        >
          AD
        </Badge>
      );
    return status === "unread" ? (
      <div className="h-2 w-2 rounded-full bg-green-500"></div>
    ) : (
      <div className="h-2 w-2 rounded-full bg-gray-200"></div>
    );
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const openUidDialog = (platformId: string) => {
    setCurrentPlatform(platformId);
    setUidDialogOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>
      <div className="w-full max-w-full border mt-5 mx-auto bg-white overflow-hidden rounded-md shadow-none">
        {/* Tab Navigation */}
        <div className="flex w-full border-gray-200 bg-white border-b">
          {[
            { id: "profile", icon: User, label: "내정보" },
            { id: "messages", icon: MessageCircle, label: "메세지" },
            { id: "achievements", icon: Award, label: "포인트" },
            { id: "settings", icon: Settings, label: "설정" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all relative cursor-pointer",
                activeTab === tab.id
                  ? "text-[#E63946] border-b-2 border-[#E63946]"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              <tab.icon
                className={cn(
                  "h-4 w-4",
                  activeTab === tab.id ? "text-[#E63946]" : ""
                )}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Content */}
        {activeTab === "profile" && (
          <div className="p-0">
            <div className="p-6 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 mb-8">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group mb-3 cursor-pointer">
                    <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                      <AvatarImage
                        src="/placeholder.svg?height=96&width=96"
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-[#F8F9FA] text-[#495057] text-xl font-medium">
                        TS
                      </AvatarFallback>
                    </Avatar>
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
                        <h2 className="text-lg font-semibold text-gray-800">
                          테스트
                        </h2>
                      </div>
                      <p className="text-gray-600 text-sm">@testmaster</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-[#E63946] border-[#E63946]/20 hover:bg-[#E63946]/5 hover:text-[#E63946] hover:border-[#E63946]/30"
                    >
                      <Edit className="h-3 w-3" />
                      편집
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
                    <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                      아이디
                    </div>
                    <div className="font-medium text-gray-800">test01</div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
                    <div className="text-sm font-medium text-gray-500 w-32 mb-2 sm:mb-0">
                      비밀번호
                    </div>
                    <div className="flex items-center gap-3">
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
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
                    <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                      이름
                    </div>
                    <div className="font-medium text-gray-800">테스트</div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-200/70">
                    <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                      e-mail
                    </div>
                    <div className="font-medium text-gray-800">
                      test01@test.com
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center py-2">
                    <div className="text-sm font-medium text-gray-500 w-32 mb-1 sm:mb-0">
                      닉네임
                    </div>
                    <div className="font-medium text-gray-800">testmaster</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons with Animation - Better integrated */}
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
                  className="px-5 py-2 h-10 text-gray-700 border-gray-300 font-medium"
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
                  className="px-5 py-2 h-10 bg-[#E63946] hover:bg-[#D62C39] flex items-center gap-1 font-medium"
                >
                  저장
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
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="p-0">
            {/* Message Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    "bg-[#E63946] hover:bg-[#D62C39]",
                    messageTab === "compose" && "bg-[#D62C39]"
                  )}
                  onClick={() => setMessageTab("compose")}
                >
                  <Send className="h-4 w-4 mr-1" />
                  발송 메세지
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    "bg-[#E63946] hover:bg-[#D62C39]",
                    messageTab === "received" && "bg-[#D62C39]"
                  )}
                  onClick={() => setMessageTab("received")}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  보낸 메세지
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 text-gray-700 gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  삭제
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 text-gray-700 gap-1"
                >
                  <Star className="h-3.5 w-3.5" />
                  즐겨찾기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 text-gray-700 gap-1"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  읽음
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 text-gray-700 gap-1"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  안읽음 표시
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="검색어 입력"
                      className="h-8 pl-8 pr-3 text-sm w-[180px] border-gray-200 focus-visible:ring-[#E63946]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 border-gray-200"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Tabs defaultValue="list">
                    <TabsList className="h-8 bg-muted/50">
                      <TabsTrigger value="list" className="h-6 px-2">
                        <div className="grid grid-cols-3 gap-0.5">
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="grid" className="h-6 px-2">
                        <div className="grid grid-cols-2 gap-0.5">
                          <div className="w-2 h-2 bg-current rounded-sm"></div>
                          <div className="w-2 h-2 bg-current rounded-sm"></div>
                          <div className="w-2 h-2 bg-current rounded-sm"></div>
                          <div className="w-2 h-2 bg-current rounded-sm"></div>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="compact" className="h-6 px-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-4 h-1 bg-current rounded-sm"></div>
                          <div className="w-4 h-1 bg-current rounded-sm"></div>
                          <div className="w-4 h-1 bg-current rounded-sm"></div>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F9FA] border-b border-gray-200">
                  <tr>
                    <th className="w-10 p-3">
                      <Checkbox
                        checked={
                          selectedMessages.length === messages.length &&
                          messages.length > 0
                        }
                        onCheckedChange={selectAllMessages}
                      />
                    </th>
                    <th className="w-10 p-3 text-left text-xs font-medium text-gray-500">
                      상태
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500">
                      내용
                    </th>
                    <th className="w-24 p-3 text-center text-xs font-medium text-gray-500">
                      날짜
                    </th>
                    <th className="w-16 p-3 text-center text-xs font-medium text-gray-500">
                      시간
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <motion.tr
                      key={message.id}
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        message.status === "unread" ? "bg-blue-50/30" : ""
                      )}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        backgroundColor: "rgba(243, 244, 246, 0.7)",
                      }}
                    >
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={selectedMessages.includes(message.id)}
                          onCheckedChange={() =>
                            toggleSelectMessage(message.id)
                          }
                        />
                      </td>
                      <td className="p-3 text-center">
                        {getMessageIcon(message.type, message.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="text-xs text-blue-600 font-medium mr-2">
                            {message.sender}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              message.status === "unread"
                                ? "font-medium"
                                : "text-gray-600"
                            )}
                          >
                            {message.title}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs text-gray-500">
                        {message.date}
                      </td>
                      <td className="p-3 text-center text-xs text-gray-500">
                        {message.time}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3 border-gray-200 bg-[#E63946] text-white hover:bg-[#D62C39] hover:text-white"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3 border-gray-200"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Points Tab */}
        {activeTab === "achievements" && (
          <div className="p-0">
            {/* Points Header */}
            <div className="bg-[#E63946] text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8" />
                  <h2 className="text-xl font-bold">보유 코코인</h2>
                </div>
                <div className="flex flex-col items-end mt-4 md:mt-0">
                  <div className="text-3xl font-bold">
                    {formatNumber(pointsData.totalPoints)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                      onClick={() => setWithdrawDialogOpen(true)}
                    >
                      출금하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Points */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#E63946] text-white">빌드 코코인</Badge>
                <span className="text-xl font-bold">
                  {formatNumber(pointsData.availablePoints)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  1일
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  3일
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  1주
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  1개월
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  3개월
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
                >
                  전체
                </Badge>
              </div>
            </div>

            {/* Points Transactions */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F9FA] border-b border-gray-200">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500">
                      코코인
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500">
                      소식사항
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-gray-500">
                      일시
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pointsData.transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        backgroundColor: "rgba(243, 244, 246, 0.7)",
                      }}
                    >
                      <td className="p-3">
                        <div
                          className={cn(
                            "font-medium",
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatNumber(transaction.amount)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "mr-2",
                              transaction.amount > 0
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            )}
                          >
                            {transaction.type}
                          </Badge>
                          <span className="text-sm text-gray-700">
                            {transaction.description}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500">
                        {transaction.date}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3 border-gray-200 bg-[#E63946] text-white hover:bg-[#D62C39] hover:text-white"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 px-3 border-gray-200"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0 border-gray-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
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
                  onClick={() =>
                    !platform.disabled && openUidDialog(platform.id)
                  }
                >
                  <div className="grid grid-cols-[100px_1fr_auto] items-center p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xl"
                        style={{ color: platform.color }}
                      >
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
          </div>
        )}

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">코코인 출금하기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">출금 가능 금액</span>
                <span className="font-bold text-lg">
                  {formatNumber(pointsData.availablePoints)}
                </span>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  출금 금액
                </label>
                <Input
                  id="amount"
                  placeholder="금액 입력"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="focus-visible:ring-[#E63946]"
                />
              </div>

              <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-2">출금 안내</div>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>( 설명 ) 회원가입시 본인 인증된 본인의 실명</p>
                  <p>( 개정번호 ) 회원가입시 본인 인증된 본인의 계좌</p>
                  <p>( 은행 ) 회원가입시 본인 인증된 본인의 계좌 은행</p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                회원가입시 본인인증된 연락처 계좌정보만 출금이 가능합니다.
                <br />
                타인의 연락처 사용시 추후 계좌이체 처리에 문제를 일으킵니다.
              </div>

              <div className="text-xs text-gray-500">
                계좌정보 오기입으로 인한 출금처리는 본인에게 책임이 있습니다.
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[#E63946] hover:bg-[#D62C39]"
                onClick={() => setWithdrawDialogOpen(false)}
              >
                코코인 출금신청
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
    </div>
  );
}
