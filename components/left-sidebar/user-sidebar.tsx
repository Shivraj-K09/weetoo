"use client";

import { ExchangeList } from "./exchange-list";
import { RefundFee } from "./refund-fee";
import { UserChat } from "./user-chat";
import { UserInfo } from "./user-info";

export function UserSidebar() {
  return (
    <div className="w-[22rem] mx-auto space-y-2">
      <UserInfo />
      <UserChat />
      <ExchangeList />
      <RefundFee />
    </div>
  );
}
