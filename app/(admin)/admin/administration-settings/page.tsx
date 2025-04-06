import type { Metadata } from "next";
import { AdministrationSettingsTable } from "@/components/admin/administration-settings/administration-settings-table";

export const metadata: Metadata = {
  title: "Administration Settings",
  description: "Manage administrator accounts and permissions.",
};

export default function AdministrationSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Administration Settings
          </h1>
          <p className="text-muted-foreground">
            Manage administrator accounts, permissions, and IP restrictions.
          </p>
        </div>
      </div>
      <AdministrationSettingsTable />
    </div>
  );
}
