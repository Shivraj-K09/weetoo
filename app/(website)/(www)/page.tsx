import { DesktopContent } from "@/components/desktop-content";
import { MobileContent } from "@/components/mobile/mobile-content";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] w-full h-full">
      <DesktopContent />
      <MobileContent />
    </div>
  );
}
