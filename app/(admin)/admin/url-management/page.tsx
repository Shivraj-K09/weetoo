import type { Metadata } from "next";
import { URLManagementTable } from "@/components/admin/url-management/url-management-table";

export const metadata: Metadata = {
  title: "Weetoo | URL Management",
  description: "Manage URLs in the system",
};

export default function URLManagementPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <URLManagementTable />
      </div>
    </div>
  );
}
