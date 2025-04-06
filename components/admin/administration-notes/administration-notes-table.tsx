"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateNoteDialog } from "./create-note-dialog";
import { EditNoteDialog } from "./edit-note-dialog";
import { DeleteNoteDialog } from "./delete-note-dialog";

// Mock data for administration notes
const mockNotes = [
  {
    id: "1",
    user: "John Smith",
    note: "Follow up on user reports about login issues",
    priority: "High",
    createdBy: "Admin User",
    date: new Date("2023-04-15"),
  },
  {
    id: "2",
    user: "Sarah Johnson",
    note: "Review new content guidelines for community posts",
    priority: "Medium",
    createdBy: "System Admin",
    date: new Date("2023-04-12"),
  },
  {
    id: "3",
    user: "Michael Brown",
    note: "Schedule maintenance for database optimization",
    priority: "Low",
    createdBy: "Tech Admin",
    date: new Date("2023-04-10"),
  },
  {
    id: "4",
    user: "Emily Davis",
    note: "Investigate reports of suspicious activity on user accounts",
    priority: "High",
    createdBy: "Security Admin",
    date: new Date("2023-04-08"),
  },
  {
    id: "5",
    user: "David Wilson",
    note: "Update user permission settings for new features",
    priority: "Medium",
    createdBy: "Admin User",
    date: new Date("2023-04-05"),
  },
];

export function AdministrationNotesTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Filter notes based on search query and priority filter
  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch =
      note.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || note.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleEdit = (note: any) => {
    setSelectedNote(note);
    setEditDialogOpen(true);
  };

  const handleDelete = (note: any) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">{priority}</Badge>;
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            {priority}
          </Badge>
        );
      case "Low":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            {priority}
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="w-full pl-8 shadow-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px] h-10 shadow-none cursor-pointer">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="h-10 shadow-none cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="w-[300px]">Note</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No notes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.user}</TableCell>
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={note.note}
                    >
                      {note.note}
                    </TableCell>
                    <TableCell>{getPriorityBadge(note.priority)}</TableCell>
                    <TableCell>{note.createdBy}</TableCell>
                    <TableCell>{format(note.date, "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 shadow-none cursor-pointer"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(note)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(note)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateNoteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedNote && (
        <>
          <EditNoteDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            note={selectedNote}
          />

          <DeleteNoteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            note={selectedNote}
          />
        </>
      )}
    </>
  );
}
