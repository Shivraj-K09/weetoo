import { Coins, Award } from "lucide-react";

interface PointsToastProps {
  action: string;
  exp: number;
  coins: number;
}

export function PointsToast({ action, exp, coins }: PointsToastProps) {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{action}</span>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-blue-600">+{exp} EXP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-amber-600">+{coins} KOR</span>
        </div>
      </div>
    </div>
  );
}
