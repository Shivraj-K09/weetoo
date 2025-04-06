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
  ShoppingBag,
  Gift,
  Repeat,
  Star,
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  CheckCircle,
} from "lucide-react";
import type { UsageHistory } from "./usage-history-table";

interface UsageDetailsDialogProps {
  usage: UsageHistory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsageDetailsDialog({
  usage,
  open,
  onOpenChange,
}: UsageDetailsDialogProps) {
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

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Get usage type icon
  const getUsageTypeIcon = (usageType: string) => {
    switch (usageType) {
      case "purchase":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "donation":
        return <Gift className="h-5 w-5 text-pink-500" />;
      case "subscription":
        return <Repeat className="h-5 w-5 text-green-500" />;
      case "premium":
        return <Star className="h-5 w-5 text-amber-500" />;
      case "service":
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  // Get usage type badge class
  const getUsageTypeBadgeClass = (usageType: string) => {
    switch (usageType) {
      case "purchase":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
      case "donation":
        return "bg-pink-50 text-pink-700 dark:bg-pink-900/20";
      case "subscription":
        return "bg-green-50 text-green-700 dark:bg-green-900/20";
      case "premium":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20";
      case "service":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  };

  // Mock additional usage data
  const additionalUsageData = {
    transactionId: "TRX-" + usage.id.substring(4),
    paymentMethod: "KOR_Coin Balance",
    receiptUrl: "/receipts/" + usage.id.toLowerCase(),
    relatedItems:
      usage.usageType === "purchase" || usage.usageType === "premium"
        ? [
            {
              name: usage.items,
              price: usage.amount,
              type: "Digital Content",
              downloadable: true,
              accessExpiry: "Lifetime",
            },
          ]
        : usage.usageType === "subscription"
        ? [
            {
              name: usage.items,
              price: usage.amount,
              type: "Subscription",
              duration: usage.items.includes("Year") ? "Annual" : "Monthly",
              autoRenew: true,
            },
          ]
        : usage.usageType === "donation"
        ? [
            {
              name: usage.items,
              price: usage.amount,
              type: "Donation",
              recipient: usage.items,
              taxDeductible: true,
            },
          ]
        : [
            {
              name: usage.items,
              price: usage.amount,
              type: "Service",
            },
          ],
    timeline: [
      {
        action: "Transaction Initiated",
        date: new Date(new Date(usage.date).getTime() - 300000).toISOString(), // 5 minutes before
        by: usage.user.name,
      },
      {
        action: "Payment Processed",
        date: new Date(new Date(usage.date).getTime() - 120000).toISOString(), // 2 minutes before
        by: "System",
      },
      {
        action: "Transaction Completed",
        date: usage.date,
        by: "System",
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            Usage Details
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${getUsageTypeBadgeClass(
                usage.usageType
              )}`}
            >
              {getUsageTypeIcon(usage.usageType)}
              {usage.usageTypeLabel}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Transaction ID: <span className="font-mono">{usage.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* User Information */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={usage.user.avatar} alt={usage.user.name} />
              <AvatarFallback>{getInitials(usage.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{usage.user.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {usage.user.uid}
              </p>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Amount Used</p>
                <p className="text-lg">{formatAmount(usage.amount)} KOR</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p>{formatDate(usage.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {getUsageTypeIcon(usage.usageType)}
              <div>
                <p className="text-sm font-medium">Usage Type</p>
                <p>{usage.usageTypeLabel}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Items/Donations</p>
                <p>{usage.items}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Transaction Details</h4>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Transaction ID</span>
                <span className="text-sm font-mono">
                  {additionalUsageData.transactionId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">Payment Method</span>
                <span className="text-sm">
                  {additionalUsageData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Receipt</span>
                <a
                  href={additionalUsageData.receiptUrl}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Receipt
                </a>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Item Details</h4>
            <div className="space-y-3">
              {additionalUsageData.relatedItems.map((item, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">Name</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">Price</span>
                    <span className="text-sm">
                      {formatAmount(item.price)} KOR
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium">Type</span>
                    <span className="text-sm">{item.type}</span>
                  </div>
                  {item.type === "Digital Content" && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium">
                          Downloadable
                        </span>
                        <span className="text-sm">
                          {"downloadable" in item && item.downloadable
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">
                          Access Expiry
                        </span>
                        <span className="text-sm">
                          {"accessExpiry" in item && item.accessExpiry}
                        </span>
                      </div>
                    </>
                  )}
                  {item.type === "Subscription" && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium">Duration</span>
                        <span className="text-sm">
                          {"duration" in item && item.duration}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Auto-Renew</span>
                        <span className="text-sm">
                          {"autoRenew" in item && item.autoRenew ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  )}
                  {item.type === "Donation" && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium">Recipient</span>
                        <span className="text-sm">
                          {"recipient" in item && item.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">
                          Tax Deductible
                        </span>
                        <span className="text-sm">
                          {"taxDeductible" in item && item.taxDeductible
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Transaction Timeline</h4>
            <div className="space-y-3">
              {additionalUsageData.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {event.action === "Transaction Initiated" && (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {event.action === "Payment Processed" && (
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    )}
                    {event.action === "Transaction Completed" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{event.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By: {event.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 bg-background pt-4 border-t mt-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="shadow-none cursor-pointer h-10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
