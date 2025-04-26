"use client";

import { User, MessageCircle, Award, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: "profile", icon: User, label: "내정보" },
    { id: "messages", icon: MessageCircle, label: "메세지" },
    { id: "achievements", icon: Award, label: "포인트" },
    { id: "settings", icon: Settings, label: "설정" },
  ];

  return (
    <div className="flex w-full border-gray-200 bg-white border-b">
      {tabs.map((tab) => (
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
  );
}
