import { Mail, Eye, Brain } from "lucide-react";

interface StatsData {
  sentToday: number | string;
  emailsRead: number;
  readRate: string;
  aiSummaries: number;
  avgReadTime: string;
}

interface StatsCardsProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card p-6 rounded-lg border border-border animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg"></div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <div className="h-3 bg-muted rounded w-8"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Emails Sent Today",
      value: stats.sentToday,
      icon: Mail,
      change: "+12%",
      changeLabel: "vs yesterday",
      positive: true,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Emails Read",
      value: stats.emailsRead,
      icon: Eye,
      change: "+5%",
      changeLabel: "vs last week",
      positive: true,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },

    {
      title: "AI Summaries",
      value: stats.aiSummaries,
      icon: Brain,
      change: "+23",
      changeLabel: "this week",
      positive: true,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-card p-6 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p
                  className="text-2xl font-bold"
                  data-testid={`stat-${card.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span
                className={card.positive ? "text-green-600" : "text-orange-600"}
              >
                {card.change}
              </span>
              <span className="text-muted-foreground ml-2">
                {card.changeLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
