import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { KorCoinCard } from "./kor-coin-card";
import { TotalUsersCard } from "./total-users-card";
import { DailySignupsCard } from "./daily-signup-card";

// Define the card data directly in this file to avoid import issues
const dashboardCards = [
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

export function SectionCards() {
  // Filter out the cards we're replacing with custom components
  const filteredCards = dashboardCards.filter(
    (card) =>
      card.id !== "kor-coin" &&
      card.id !== "total-registered-users" &&
      card.id !== "new-signups"
  );

  // Create a function to render a standard card
  const renderCard = (card: (typeof dashboardCards)[0]) => (
    <Card key={card.id} className="@container/card">
      <CardHeader className="relative">
        <CardDescription>{card.description}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {card.value}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className={`flex gap-1 rounded-lg text-xs ${card.trend.direction === "down" ? "text-destructive" : ""}`}
          >
            <card.trend.icon className="size-3" />
            {card.trend.percentage}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {card.footer.text} <card.footer.icon className="size-4" />
        </div>
        <div className="text-muted-foreground">{card.footer.subtext}</div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {/* Custom KOR_Coin card in position 1 */}
      <KorCoinCard />

      {/* First 2 standard cards (positions 2-3) */}
      {filteredCards.slice(0, 2).map(renderCard)}

      {/* Custom Daily Signups card in position 4 */}
      <DailySignupsCard />

      {/* Next standard card (position 5) */}
      {filteredCards.slice(2, 3).map(renderCard)}

      {/* Custom Total Users card in position 6 */}
      <TotalUsersCard />

      {/* Remaining standard cards (positions 7+) */}
      {filteredCards.slice(3).map(renderCard)}
    </div>
  );
}
