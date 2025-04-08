import type { Metadata } from "next";
import { AdministrationNotesTable } from "@/components/admin/administration-notes/administration-notes-table";

export const metadata: Metadata = {
  title: "Weetoo | Administration Notes",
  description: "Manage administration notes and tasks",
};

export default function AdministrationNotesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Administration Notes
          </h1>
          <p className="text-muted-foreground">
            Manage and track important administration notes and tasks
          </p>
        </div>
      </div>
      <AdministrationNotesTable />
    </div>
  );
}
