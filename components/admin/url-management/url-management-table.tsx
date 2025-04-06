"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Check,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";

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
import { Badge } from "@/components/ui/badge";
import { EditURLDialog } from "./edit-url-dialog";
import { DeleteURLDialog } from "./delete-url-dialog";
import { CreateURLDialog } from "./create-url-dialog";

// Mock data for URLs
const mockURLs = [
  {
    id: "1",
    name: "Main Website",
    url: "https://example.com",
    location: "Homepage",
    status: "active",
    lastUpdated: new Date("2023-10-15"),
  },
  {
    id: "2",
    name: "Blog",
    url: "https://example.com/blog",
    location: "Blog Section",
    status: "active",
    lastUpdated: new Date("2023-11-20"),
  },
  {
    id: "3",
    name: "Support Portal",
    url: "https://support.example.com",
    location: "Support",
    status: "inactive",
    lastUpdated: new Date("2023-09-05"),
  },
  {
    id: "4",
    name: "Documentation",
    url: "https://docs.example.com",
    location: "Documentation",
    status: "active",
    lastUpdated: new Date("2023-12-01"),
  },
  {
    id: "5",
    name: "API Endpoint",
    url: "https://api.example.com/v1",
    location: "Developer Portal",
    status: "active",
    lastUpdated: new Date("2023-11-10"),
  },
  {
    id: "6",
    name: "Legacy Portal",
    url: "https://legacy.example.com",
    location: "Old System",
    status: "inactive",
    lastUpdated: new Date("2022-05-18"),
  },
  {
    id: "7",
    name: "Partner Dashboard",
    url: "https://partners.example.com",
    location: "Partners Section",
    status: "active",
    lastUpdated: new Date("2023-10-25"),
  },
];

export function URLManagementTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [urls, setUrls] = useState(mockURLs);
  const [selectedUrl, setSelectedUrl] = useState<(typeof mockURLs)[0] | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter URLs based on search query
  const filteredUrls = urls.filter(
    (url) =>
      url.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new URL
  const handleCreateUrl = (
    newUrl: Omit<(typeof mockURLs)[0], "id" | "lastUpdated">
  ) => {
    const newId = (
      Math.max(...urls.map((url) => Number.parseInt(url.id))) + 1
    ).toString();
    setUrls([
      ...urls,
      {
        id: newId,
        ...newUrl,
        lastUpdated: new Date(),
      },
    ]);
    setIsCreateDialogOpen(false);
  };

  // Handle editing a URL
  const handleEditUrl = (updatedUrl: (typeof mockURLs)[0]) => {
    setUrls(
      urls.map((url) =>
        url.id === updatedUrl.id
          ? { ...updatedUrl, lastUpdated: new Date() }
          : url
      )
    );
    setIsEditDialogOpen(false);
    setSelectedUrl(null);
  };

  // Handle deleting a URL
  const handleDeleteUrl = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id));
    setIsDeleteDialogOpen(false);
    setSelectedUrl(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">URL Management</h2>
          <p className="text-muted-foreground">Manage URLs in the system</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-10 shadow-none cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create URL
        </Button>
      </div>

      <div className="">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search URLs..."
            className="pl-8 h-10 shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[250px]">
                <Button variant="ghost" className="p-0 font-medium">
                  URL
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Location
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Last Updated
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUrls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No URLs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUrls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="font-medium">{url.name}</TableCell>
                  <TableCell>
                    <a
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {url.url}
                    </a>
                  </TableCell>
                  <TableCell>{url.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        url.status === "active" ? "default" : "secondary"
                      }
                      className={
                        url.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {url.status === "active" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      {url.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(url.lastUpdated, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="shadow-none cursor-pointer"
                      size="icon"
                      onClick={() => {
                        setSelectedUrl(url);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shadow-none cursor-pointer"
                      onClick={() => {
                        setSelectedUrl(url);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 stroke-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create URL Dialog */}
      <CreateURLDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUrl}
      />

      {/* Edit URL Dialog */}
      {selectedUrl && (
        <EditURLDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          url={selectedUrl}
          onSubmit={handleEditUrl}
        />
      )}

      {/* Delete URL Dialog */}
      {selectedUrl && (
        <DeleteURLDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          url={selectedUrl}
          onConfirm={() => handleDeleteUrl(selectedUrl.id)}
        />
      )}
    </>
  );
}
