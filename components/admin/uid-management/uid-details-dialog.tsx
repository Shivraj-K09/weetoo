"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Shield,
  Fingerprint,
} from "lucide-react";
import type { UidData } from "./uid-management-table";

interface UidDetailsDialogProps {
  uidData: UidData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UidDetailsDialog({
  uidData,
  open,
  onOpenChange,
}: UidDetailsDialogProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Get situation badge
  const getSituationBadge = (situation: string) => {
    if (situation === "verified") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 dark:bg-green-900/20 flex gap-1 items-center"
        >
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    } else if (situation === "pending") {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 flex gap-1 items-center"
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    } else if (situation === "rejected") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-900/20 flex gap-1 items-center"
        >
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 flex gap-1 items-center"
        >
          <AlertTriangle className="h-3 w-3" />
          Suspended
        </Badge>
      );
    }
  };

  // Mock additional UID data
  const additionalUidData = {
    verificationDetails: {
      idType: "National ID",
      idNumber: "****-****-" + uidData.uid.substring(uidData.uid.length - 4),
      verificationDate:
        uidData.situation === "verified" ? uidData.registrationDate : null,
      rejectionReason:
        uidData.situation === "rejected"
          ? "Provided ID document does not match user information."
          : null,
      suspensionReason:
        uidData.situation === "suspended"
          ? "Account suspended due to suspicious activity."
          : null,
    },
    exchangeDetails: {
      exchangeId:
        "EX-" +
        uidData.exchange.substring(0, 3).toUpperCase() +
        "-" +
        uidData.uid.substring(uidData.uid.length - 4),
      apiKey:
        "****************************" +
        uidData.uid.substring(uidData.uid.length - 4),
      accountLevel: "Level 2",
      tradingEnabled: uidData.situation === "verified",
      withdrawalEnabled: uidData.situation === "verified",
    },
    activityHistory: [
      {
        action: "Registration",
        date: new Date(
          new Date(uidData.registrationDate).getTime() - 3600000
        ).toISOString(), // 1 hour before
        by: uidData.user.name,
      },
      {
        action:
          uidData.situation === "verified"
            ? "Verification"
            : uidData.situation === "rejected"
            ? "Rejection"
            : uidData.situation === "suspended"
            ? "Suspension"
            : "Pending Review",
        date: uidData.registrationDate,
        by: uidData.approvedBy || "System",
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            UID Details
            {getSituationBadge(uidData.situation)}
          </DialogTitle>
          <DialogDescription>
            User Identification:{" "}
            <span className="font-mono">{uidData.uid}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* User Information */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={uidData.user.avatar} alt={uidData.user.name} />
              <AvatarFallback>{getInitials(uidData.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{uidData.user.name}</h3>
              <p className="text-sm text-muted-foreground">
                Nickname: {uidData.nickname}
              </p>
            </div>
          </div>

          <Separator />

          {/* UID Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Fingerprint className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">UID</p>
                <p className="font-mono">{uidData.uid}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Exchange</p>
                <p>{uidData.exchange}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Registration Date</p>
                <p>{formatDate(uidData.registrationDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Approved By</p>
                <p>{uidData.approvedBy || "Pending Approval"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Verification Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Verification Details</h4>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">ID Type</span>
                <span className="text-sm">
                  {additionalUidData.verificationDetails.idType}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">ID Number</span>
                <span className="text-sm font-mono">
                  {additionalUidData.verificationDetails.idNumber}
                </span>
              </div>

              {uidData.situation === "verified" &&
                additionalUidData.verificationDetails.verificationDate && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">
                      Verification Date
                    </span>
                    <span className="text-sm">
                      {formatDate(
                        additionalUidData.verificationDetails.verificationDate
                      )}
                    </span>
                  </div>
                )}

              {uidData.situation === "rejected" &&
                additionalUidData.verificationDetails.rejectionReason && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">
                      Rejection Reason
                    </span>
                    <span className="text-sm">
                      {additionalUidData.verificationDetails.rejectionReason}
                    </span>
                  </div>
                )}

              {uidData.situation === "suspended" &&
                additionalUidData.verificationDetails.suspensionReason && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium">
                      Suspension Reason
                    </span>
                    <span className="text-sm">
                      {additionalUidData.verificationDetails.suspensionReason}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Exchange Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Exchange Details</h4>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Exchange ID</span>
                <span className="text-sm font-mono">
                  {additionalUidData.exchangeDetails.exchangeId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">API Key</span>
                <span className="text-sm font-mono">
                  {additionalUidData.exchangeDetails.apiKey}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Account Level</span>
                <span className="text-sm">
                  {additionalUidData.exchangeDetails.accountLevel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Trading Enabled</span>
                <span className="text-sm">
                  {additionalUidData.exchangeDetails.tradingEnabled
                    ? "Yes"
                    : "No"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Withdrawal Enabled</span>
                <span className="text-sm">
                  {additionalUidData.exchangeDetails.withdrawalEnabled
                    ? "Yes"
                    : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Activity History</h4>
            <div className="space-y-3">
              {additionalUidData.activityHistory.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {activity.action === "Registration" && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activity.action === "Verification" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {activity.action === "Pending Review" && (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    {activity.action === "Rejection" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {activity.action === "Suspension" && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By: {activity.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 bg-background pt-4 border-t mt-auto">
          {uidData.situation === "pending" && (
            <>
              <Button
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
