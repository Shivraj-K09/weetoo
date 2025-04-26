import type { Message, PointsData, Platform } from "@/types";

// Cost for changing nickname (after the first free change)
export const NICKNAME_CHANGE_COST = 10000;

// Sample message data
export const messages: Message[] = [
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
export const pointsData: PointsData = {
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
export const platforms: Platform[] = [
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
