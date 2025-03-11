import { ExchangeList } from "./exchange-list";
import { RefundFee } from "./refund-fee";
import { UserChat } from "./user-chat";
import { UserInfo } from "./user-info";

export function UserSidebar() {
  return (
    <div className="lg:max-w-[18rem] w-full h-full flex gap-1 flex-col">
      <UserInfo />
      <UserChat />
      <ExchangeList />
      <RefundFee />
    </div>
  );
}
