import Image from "next/image";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="flex py-2 items-center">
      <div className="container mx-auto flex gap-10 justify-end">
        <Link
          href="/purchase"
          className="flex items-center font-semibold text-sm gap-2"
        >
          <Image src="/coins.png" width={25} height={25} alt="stack of coins" />
          코코인 충전
        </Link>

        <Link
          href="/customer-support"
          className="flex items-center text-sm font-semibold gap-2"
        >
          <Image src="/computer.png" width={25} height={25} alt="computer" />
          고객센터
        </Link>
      </div>
    </div>
  );
}
