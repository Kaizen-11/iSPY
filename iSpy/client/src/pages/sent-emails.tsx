import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { EmailList } from "@/components/email-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Email } from "@shared/schema";

export default function SentEmails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const filteredEmails = emails.filter((email) => {
    const matchesSearch = email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || email.readStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = emails.reduce((acc: Record<string, number>, email) => {
    acc[email.readStatus] = (acc[email.readStatus] || 0) + 1;
    return acc;
  }, { all: emails.length });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar emailCount={emails.length} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="back-to-dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold">Sent Emails</h2>
                <p className="text-muted-foreground">Track and analyze your sent emails</p>
              </div>
            </div>
            <Link href="/compose">
              <Button data-testid="compose-new-email">
                Compose New Email
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-6">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-emails"
                />
              </div>
              <Button variant="outline" size="icon" data-testid="filter-emails">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Filter by status:</span>
              {[
                { key: "all", label: "All", count: statusCounts.all || 0 },
                { key: "read", label: "Read", count: statusCounts.read || 0 },
                { key: "pending", label: "Sent", count: statusCounts.pending || 0 },
                { key: "unread", label: "Unread", count: statusCounts.unread || 0 },
              ].map((status) => (
                <Badge
                  key={status.key}
                  variant={filterStatus === status.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterStatus(status.key)}
                  data-testid={`filter-${status.key}`}
                >
                  {status.label} ({status.count})
                </Badge>
              ))}
            </div>
          </div>

          {/* Email List */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {filteredEmails.length} 
                  {searchTerm || filterStatus !== "all" ? " filtered" : ""} emails
                </h3>
                <span className="text-sm text-muted-foreground">
                  Real-time tracking active
                </span>
              </div>
            </div>
            <div className="p-6">
              {filteredEmails.length > 0 ? (
                <EmailList emails={filteredEmails} isLoading={isLoading} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all" 
                      ? "No emails match your current filters."
                      : "No emails sent yet."
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <Link href="/compose">
                      <Button className="mt-4" data-testid="compose-first-email">
                        Send Your First Email
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
