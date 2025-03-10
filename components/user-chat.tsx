import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function UserChat() {
  return (
    <div className="h-[22rem] bg-[#EBE0E1] rounded-md">
      <div className="flex flex-col h-full">
        <div className="h-9 bg-[#D5828E] rounded-sm px-4 flex items-center justify-between w-full">
          <span className="text-xs text-white">Users Online: 3,280</span>
          <span className="text-xs text-white">채팅방 규정</span>
        </div>
        <div className="flex flex-1"></div>
        <div className="p-1.5">
          <div className="flex items-center relative">
            <Input
              placeholder="Please Login First"
              className="h-9 shadow-none placeholder:text-white bg-[#A1999A] rounded-sm text-[0.6875rem] pr-17.5"
            />
            <Button className="h-8 absolute right-0 rounded-sm text-xs bg-[#7B7A7F] transition-colors duration-200 ease-in-out">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
