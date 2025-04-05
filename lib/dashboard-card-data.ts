import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

export interface CardData {
  id: string;
  title: string;
  value: string | number;
  description: string;
  trend: {
    direction: "up" | "down";
    percentage: string;
    icon: typeof TrendingUpIcon | typeof TrendingDownIcon;
  };
  footer: {
    text: string;
    subtext: string;
    icon: typeof TrendingUpIcon | typeof TrendingDownIcon;
  };
}

export const dashboardCards: CardData[] = [
  {
    id: "kor-coin",
    title: "KOR_Coin",
    value: "1,245,890",
    description: "KOR_Coin",
    trend: {
      direction: "up",
      percentage: "+12.5%",
      icon: TrendingUpIcon,
    },
    footer: {
      text: "Trending up this month",
      subtext: "Visitors for the last 6 months",
      icon: TrendingUpIcon,
    },
  },
  {
    id: "new-customers",
    title: "New Customers",
    value: "845,230",
    description: "New Customers",
    trend: {
      direction: "down",
      percentage: "-20%",
      icon: TrendingDownIcon,
    },
    footer: {
      text: "Down 20% this period",
      subtext: "Acquisition needs attention",
      icon: TrendingDownIcon,
    },
  },
  {
    id: "activity-points",
    title: "Activity Points",
    value: "325,450",
    description: "Activity Points",
    trend: {
      direction: "up",
      percentage: "+12.5%",
      icon: TrendingUpIcon,
    },
    footer: {
      text: "Strong user retention",
      subtext: "Engagement exceed targets",
      icon: TrendingUpIcon,
    },
  },
  {
    id: "using-kor-coin",
    title: "Using KOR_Coin",
    value: "512,670",
    description: "Using KOR_Coin",
    trend: {
      direction: "up",
      percentage: "+4.5%",
      icon: TrendingUpIcon,
    },
    footer: {
      text: "Steady performance",
      subtext: "Meets growth projections",
      icon: TrendingUpIcon,
    },
  },
  {
    id: "new-signups",
    title: "New signups daily",
    value: "1,245",
    description: "New signups daily",
    trend: {
      direction: "down",
      percentage: "-10%",
      icon: TrendingDownIcon,
    },
    footer: {
      text: "Down 10% this period",
      subtext: "Acquisition needs attention",
      icon: TrendingDownIcon,
    },
  },
  {
    id: "total-registered-users",
    title: "Total registered users",
    value: "1,245,890",
    description: "Total registered users",
    trend: {
      direction: "up",
      percentage: "+12.5%",
      icon: TrendingUpIcon,
    },
    footer: {
      text: "Trending up this month",
      subtext: "Visitors for the last 6 months",
      icon: TrendingUpIcon,
    },
  },
  {
    id: "daily-uid-registration",
    title: "Daily UID registration",
    value: "845,230",
    description: "Daily UID registration",
    trend: {
      direction: "down",
      percentage: "-20%",
      icon: TrendingDownIcon,
    },
    footer: {
      text: "Down 20% this period",
      subtext: "Acquisition needs attention",
      icon: TrendingDownIcon,
    },
  },
  {
    id: "trading-volume",
    title: "Trading volume",
    value: "₩ 325,450",
    description: "Trading volume",
    trend: {
      direction: "up",
      percentage: "+12.5%",
      icon: TrendingUpIcon,
    },
    footer: {
      text: "Strong user retention",
      subtext: "Engagement exceed targets",
      icon: TrendingUpIcon,
    },
  },
];
