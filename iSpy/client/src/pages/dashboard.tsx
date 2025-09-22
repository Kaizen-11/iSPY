import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { EmailList } from "@/components/email-list";
import { AiSummaryCard } from "@/components/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Edit, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Email, AiSummary } from "@shared/schema";

interface StatsResponse {
  sentToday: number;
  emailsRead: number;
  readRate: string;
  aiSummaries: number;
  avgReadTime: string;
}

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  const { data: emails = [], isLoading: emailsLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const { data: summaries = [], isLoading: summariesLoading } = useQuery<AiSummary[]>({
    queryKey: ["/api/summaries"],
  });

  const generateSummary = async () => {
    try {
      await apiRequest("POST", "/api/summaries/generate");
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "AI Summary Generated",
        description: "A new summary has been created from your recent emails.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  const recentEmails = emails.slice(0, 4);
  const recentSummaries = summaries.slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar emailCount={emails.length} summaryCount={summaries.length} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">Monitor your email intelligence and read receipts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/compose">
                <Button data-testid="compose-email-button">
                  <Edit className="w-4 h-4 mr-2" />
                  Compose Email
                </Button>
              </Link>
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={generateSummary} data-testid="generate-summary-button">
                  <Brain className="w-5 h-5" />
                </Button>
                {summaries.some(s => !s.createdAt || new Date().getTime() - new Date(s.createdAt).getTime() < 300000) && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full notification-dot"></div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <StatsCards 
            stats={stats || { sentToday: 0, emailsRead: 0, readRate: "0%", aiSummaries: 0, avgReadTime: "0m" }} 
            isLoading={statsLoading} 
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Emails */}
            <div className="lg:col-span-2 bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Sent Emails</h3>
                  <span className="text-sm text-muted-foreground">Real-time tracking</span>
                </div>
              </div>
              <div className="p-6">
                <EmailList emails={recentEmails} isLoading={emailsLoading} />
                
                {!emailsLoading && emails.length > 4 && (
                  <div className="mt-6">
                    <Link href="/sent">
                      <Button variant="ghost" className="w-full" data-testid="view-all-emails">
                        View All Sent Emails →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Summaries */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Summaries</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {summariesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
                        <div className="flex justify-between mb-3">
                          <div className="h-4 bg-muted rounded w-20"></div>
                          <div className="h-3 bg-muted rounded w-12"></div>
                        </div>
                        <div className="h-12 bg-muted rounded mb-3"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-muted rounded w-16"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentEmails.length > 0 ? (
                  recentEmails.slice(0, 3).map((email, index) => (
                    <AiSummaryCard 
                      key={email.id} 
                      email={email} 
                      variant={index === 0 ? "gradient" : index === 1 ? "default" : "success"}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No AI summaries yet.</p>
                    <Button onClick={generateSummary} size="sm" data-testid="generate-first-summary">
                      Generate Summary
                    </Button>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={generateSummary}
                    data-testid="configure-ai-settings"
                  >
                    Generate New Summary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
