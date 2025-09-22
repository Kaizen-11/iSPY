import { Link, useLocation } from "wouter";
import {
  Mail,
  Edit,
  Send,
  Brain,
  BarChart3,
  Settings,
  User,
} from "lucide-react";

interface SidebarProps {
  emailCount?: number;
  summaryCount?: number;
}

export function Sidebar({ emailCount = 0, summaryCount = 0 }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      current: location === "/",
    },
    {
      name: "Compose",
      href: "/compose",
      icon: Edit,
      current: location === "/compose",
    },
    {
      name: "Sent Emails",
      href: "/sent",
      icon: Send,
      current: location === "/sent",
      badge: emailCount,
    },
    {
      name: "AI Summaries",
      href: "/summaries",
      icon: Brain,
      current: location === "/summaries",
      badge: summaryCount,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">iSpy</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="w-5 h-5" />
                <span className={item.current ? "font-medium" : ""}>
                  {item.name}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.name === "AI Summaries" && summaryCount > 0 && (
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full notification-dot"></div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">iSpy Sqaud</p>
            <p
              className="text-xs text-muted-foreground 
              truncate"
            >
              nsatish4@asu.edu
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
