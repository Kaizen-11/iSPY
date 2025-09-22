import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Email, AiSummary } from "@shared/schema";

/* Simple toggle switch */
function ToggleSwitch({ enabled, onChange }: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200
        ${enabled 
          ? 'bg-blue-600' 
          : 'bg-gray-300 dark:bg-gray-600'
        }
      `}
    >
      <div
        className={`
          absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200
          bg-white shadow-sm
          ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}

/* Simple theme toggle */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const on = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", on);
    setIsDark(on);
  }, []);

  const apply = (on: boolean) => {
    document.documentElement.classList.toggle("dark", on);
    localStorage.setItem("theme", on ? "dark" : "light");
    setIsDark(on);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div>
        <div className="font-medium">Dark mode</div>
        <p className="text-sm text-muted-foreground">Toggle the dashboard theme</p>
      </div>
      <ToggleSwitch enabled={isDark} onChange={apply} />
    </div>
  );
}

/* Simple notification settings */
function NotificationSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <h3 className="font-medium">Notifications</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Email notifications</p>
          <p className="text-xs text-muted-foreground">Get notified when emails are read</p>
        </div>
        <ToggleSwitch enabled={emailNotifs} onChange={setEmailNotifs} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: emails = [] } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const { data: summaries = [] } = useQuery<AiSummary[]>({
    queryKey: ["/api/summaries"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar emailCount={emails.length} summaryCount={summaries.length} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-muted-foreground">Manage your application preferences and account settings</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Appearance */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <ThemeToggle />
          </section>

          {/* Notifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <NotificationSettings />
          </section>

          {/* Account */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Account</h3>
            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full justify-start h-auto p-4"
                onClick={() => alert("Login: connect to your auth flow.")}
              >
                <div className="text-left">
                  <div className="font-medium">Log in</div>
                  <div className="text-sm opacity-80">Connect your email account</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => alert("Add account: start OAuth/link flow.")}
              >
                <div className="text-left">
                  <div className="font-medium">Add account</div>
                  <div className="text-sm text-muted-foreground">Link another mailbox to track emails from multiple accounts</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => alert("Logout: call your sign-out.")}
              >
                <div className="text-left">
                  <div className="font-medium">Log out</div>
                  <div className="text-sm text-muted-foreground">Sign out of your current session</div>
                </div>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}