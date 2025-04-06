"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface EditIpManagementDialogProps {
  admin: {
    id: string;
    name: string;
    allowedIps: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIpManagementDialog({
  admin,
  open,
  onOpenChange,
}: EditIpManagementDialogProps) {
  const [ips, setIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [ipError, setIpError] = useState("");

  useEffect(() => {
    if (admin && open) {
      setIps(admin.allowedIps || []);
    }
  }, [admin, open]);

  const handleSave = () => {
    // Here you would typically send the updated IPs to your API
    console.log("Saving IPs for admin:", admin.id, ips);

    // Close dialog
    onOpenChange(false);
  };

  const addIp = () => {
    // Basic IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(newIp)) {
      setIpError("Please enter a valid IP address");
      return;
    }

    if (ips.includes(newIp)) {
      setIpError("This IP is already added");
      return;
    }

    setIps([...ips, newIp]);
    setNewIp("");
    setIpError("");
  };

  const removeIp = (ip: string) => {
    setIps(ips.filter((item) => item !== ip));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit IP Management</DialogTitle>
          <DialogDescription>
            Manage allowed IP addresses for {admin.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter IP address"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addIp}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ipError && <p className="text-sm text-destructive">{ipError}</p>}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Current IP Addresses</h3>
            <div className="flex flex-wrap gap-2">
              {ips.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No IP addresses added
                </p>
              ) : (
                ips.map((ip) => (
                  <Badge
                    key={ip}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {ip}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeIp(ip)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
