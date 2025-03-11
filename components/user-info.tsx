import { CircleUserRoundIcon, SettingsIcon, UserIcon } from "lucide-react";

export function UserInfo() {
  return (
    <div className="p-4 py-6  bg-[#EBE0E1] rounded-md">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 w-full justify-between">
          <div className="flex gap-2">
            <CircleUserRoundIcon className="stroke-[#79747e] w-7 h-7" />
            <div className="flex flex-col gap-0">
              <span className="text-sm">Guest</span>
              <button className="cursor-pointer px-1 py-0 ">
                <span className="text-xs">Login Required</span>
              </button>
            </div>
          </div>

          <div className="flex items-center flex-col">
            <div className="flex items-center gap-1">
              <UserIcon className="stroke-[#79747e] w-5 h-5" />
              <span className="text-xs">Lvl 1</span>
            </div>
            <button className="cursor-pointer px-1 py-0 hover:bg-[] ">
              <span className="text-xs">Log Out</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex text-xs flex-col gap-1">
            <span>kor_coin</span>
            <span className="text-[#FF0303]">50,000</span>
          </div>
          <div className="flex text-xs flex-col gap-1">
            <span>in box</span>
            <span>3</span>
          </div>
          <div className="flex text-xs items-center flex-col gap-1">
            <span>my page</span>
            <SettingsIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
