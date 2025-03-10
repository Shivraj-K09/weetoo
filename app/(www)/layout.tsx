import { Navigation } from "@/components/navigation";
import { RightSidebar } from "@/components/right-sidebar";
import { TopBar } from "@/components/top-bar";
import { UserSidebar } from "@/components/user-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full h-full flex flex-col overflow-y-auto">
        <TopBar />
        <Navigation />
        <div className="container mx-auto px-5 py-2 gap-4 flex h-full overflow-y-auto">
          <UserSidebar />
          <div className="flex flex-1 h-full overflow-y-auto">{children}</div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
