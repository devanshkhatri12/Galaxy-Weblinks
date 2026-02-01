/**
 * Manager Messages Page
 *
 * Allows managers to view and manage contact form submissions.
 * Managers can update the status of messages (pending, read, responded, archived).
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "pending" | "read" | "responded" | "archived";
  created_at: string;
  responded_at?: string;
}

export default function ManagerMessagesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const supabase = createClient();

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateMessageStatus(messageId: string, newStatus: string) {
    setIsSaving(true);
    setError(null);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "responded") {
        updateData.responded_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("contact_submissions")
        .update(updateData)
        .eq("id", messageId);

      if (updateError) throw updateError;

      // Update local state
      setMessages(
        messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: newStatus as any,
                responded_at: updateData.responded_at,
              }
            : m,
        ),
      );

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          status: newStatus as any,
          responded_at: updateData.responded_at,
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update message");
    } finally {
      setIsSaving(false);
    }
  }

  const filteredMessages =
    filterStatus === "all"
      ? messages
      : messages.filter((m) => m.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "read":
        return "bg-blue-100 text-blue-800";
      case "responded":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Manage contact form submissions from visitors.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Message updated successfully
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Messages ({filteredMessages.length})</CardTitle>
              <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedMessage?.id === msg.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {msg.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {msg.email}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        className={`text-xs ${getStatusColor(msg.status)}`}
                      >
                        {msg.status}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No messages found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <CardDescription>
                  From: {selectedMessage.name} ({selectedMessage.email})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.email}
                    </p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        selectedMessage.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={selectedMessage.message}
                    readOnly
                    className="mt-1 resize-none"
                    rows={5}
                  />
                </div>

                {/* Status Update */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select
                    value={selectedMessage.status}
                    onValueChange={(value) =>
                      updateMessageStatus(selectedMessage.id, value)
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedMessage.responded_at && (
                  <div className="text-sm text-muted-foreground">
                    Responded on:{" "}
                    {new Date(
                      selectedMessage.responded_at,
                    ).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
                Select a message to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
