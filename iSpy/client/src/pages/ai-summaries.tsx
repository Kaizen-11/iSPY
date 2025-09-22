import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { AiSummaryCard } from "@/components/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Search, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Email } from "@shared/schema";

export default function AiSummaries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const { toast } = useToast();

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/summaries/generate");
    },
    onSuccess: () => {
      toast({
        title: "AI Summary Generated",
        description: "A new summary has been created from your recent emails.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEmails = emails.filter((email) => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
                <h2 className="text-2xl font-bold">AI Summaries</h2>
                <p className="text-muted-foreground">AI-powered insights from your communications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground mr-4">Live AI processing</span>
              <Button 
                onClick={() => generateSummaryMutation.mutate()}
                disabled={generateSummaryMutation.isPending}
                data-testid="generate-new-summary"
              >
                <Plus className="w-4 h-4 mr-2" />
                {generateSummaryMutation.isPending ? "Generating..." : "Generate Summary"}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search summaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-summaries"
              />
            </div>

            {/* Status Filter Badges */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Filter by status:</span>
              {[
                { key: "all", label: "All", count: statusCounts.all || 0 },
                { key: "read", label: "Read", count: statusCounts.read || 0 },
                { key: "pending", label: "Pending", count: statusCounts.pending || 0 },
                { key: "unread", label: "Unread", count: statusCounts.unread || 0 },
              ].map((status) => (
                <Badge
                  key={status.key}
                  variant={filterSource === status.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterSource(status.key)}
                  data-testid={`filter-${status.key}`}
                >
                  {status.label} ({status.count})
                </Badge>
              ))}
            </div>
          </div>

          {/* Summaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-20 bg-muted rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                </div>
              ))
            ) : filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <AiSummaryCard
                  key={email.id}
                  email={email}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || filterSource !== "all" 
                      ? "No emails match your filters"
                      : "No emails available for AI analysis"
                    }
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || filterSource !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Send some emails first, then click on them to generate AI summaries."
                    }
                  </p>
                  {!searchTerm && filterSource === "all" && (
                    <Button 
                      onClick={() => generateSummaryMutation.mutate()}
                      disabled={generateSummaryMutation.isPending}
                      data-testid="generate-first-summary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Send Your First Email
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {filteredEmails.length > 0 && (
            <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-semibold mb-4">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateSummaryMutation.mutate()}
                  disabled={generateSummaryMutation.isPending}
                  data-testid="quick-generate-summary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Summary
                </Button>
                <Button variant="outline" size="sm" data-testid="export-summaries">
                  Export All Summaries
                </Button>
                <Button variant="outline" size="sm" data-testid="configure-ai">
                  Configure AI Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
