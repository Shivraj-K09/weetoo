import { KorcoinChart } from "./chart/kor-coin-chart";
import { UserSignupChart } from "./chart/user-signup-chart";
import { SectionCards } from "../dashboard/section-cards";
import { KorCoinTable } from "./tables/kor-coin-table";
import { UserSignUpTable } from "./tables/user-signup-table";

export function AdminDevelopment() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KorcoinChart />
        <UserSignupChart />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KorCoinTable />
        <UserSignUpTable />
      </div>
    </div>
  );
}
