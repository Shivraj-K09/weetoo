import Link from "next/link";

export function Navigation() {
  return (
    <div className="bg-[#E74C3C] w-full lg:inline-flex py-3.5 text-white items-center hidden">
      <div className="mx-auto container">
        <div className="flex items-center justify-center gap-20 xl:gap-36">
          <Link href="/trader">트레이더</Link>
          <Link href="/community">커뮤니티</Link>
          <Link href="/investment">투자대회</Link>
          <Link href="/news">뉴스</Link>
          <Link href="/exchange">거래소</Link>
        </div>
      </div>
    </div>
  );
}
