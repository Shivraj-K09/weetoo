"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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
import { ViewNoteDialog } from "./view-note-dialog";

interface AdminNote {
  id: string;
  user_id: string;
  note: string;
  priority: string;
  created_by: string;
  date: string;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  creator?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export function AdministrationNotesTable() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<AdminNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch notes from Supabase
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("admin_notes")
          .select(
            `
            *,
            user:user_id(first_name, last_name, email),
            creator:created_by(first_name, last_name, email)
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching notes:", error);
          return;
        }

        setNotes(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Refresh notes after create, edit, or delete
  const refreshNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_notes")
        .select(
          `
          *,
          user:user_id(first_name, last_name, email),
          creator:created_by(first_name, last_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search query and priority filter
  const filteredNotes = notes.filter((note) => {
    const userName = note.user
      ? `${note.user.first_name || ""} ${note.user.last_name || ""}`.toLowerCase()
      : "";
    const creatorName = note.creator
      ? `${note.creator.first_name || ""} ${note.creator.last_name || ""}`.toLowerCase()
      : "";
    const noteText = note.note.toLowerCase();

    const matchesSearch =
      userName.includes(searchQuery.toLowerCase()) ||
      creatorName.includes(searchQuery.toLowerCase()) ||
      noteText.includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || note.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleEdit = (note: AdminNote) => {
    setSelectedNote(note);
    setEditDialogOpen(true);
  };

  const handleDelete = (note: AdminNote) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const handleView = (note: AdminNote) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
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
          {currentUserRole === "super_admin" && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="h-10 shadow-none cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading notes...
                  </TableCell>
                </TableRow>
              ) : filteredNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No notes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">
                      {note.user
                        ? getFullName(note.user.first_name, note.user.last_name)
                        : "Unknown User"}
                    </TableCell>
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={note.note}
                    >
                      {note.note}
                    </TableCell>
                    <TableCell>{getPriorityBadge(note.priority)}</TableCell>
                    <TableCell>
                      {note.creator
                        ? getFullName(
                            note.creator.first_name,
                            note.creator.last_name
                          )
                        : "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(note.date), "MMM dd, yyyy")}
                    </TableCell>
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
                          <DropdownMenuItem
                            onClick={() => handleView(note)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {currentUserRole === "super_admin" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEdit(note)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(note)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
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
        onNoteCreated={refreshNotes}
      />

      {selectedNote && (
        <>
          <ViewNoteDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            note={selectedNote}
          />

          <EditNoteDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            note={selectedNote}
            onNoteUpdated={refreshNotes}
          />

          <DeleteNoteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            note={selectedNote}
            onNoteDeleted={refreshNotes}
          />
        </>
      )}
    </>
  );
}
