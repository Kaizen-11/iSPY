import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Moon, Sun, Bell, X } from "lucide-react";

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

/* Clean Settings Modal */
export default function SettingsSheet({ open }: { open: boolean }) {
  const [, navigate] = useLocation();
  if (!open) return null;

  const onClose = () => navigate("/");

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-card text-foreground border-l border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
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
              <button
                type="button"
                onClick={() => alert("Login: connect to your auth flow.")}
                className="w-full p-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition text-left"
              >
                <div className="font-medium">Log in</div>
                <div className="text-sm opacity-80">Connect your email account</div>
              </button>
              
              <button
                type="button"
                onClick={() => alert("Add account: start OAuth/link flow.")}
                className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent transition text-left"
              >
                <div className="font-medium">Add account</div>
                <div className="text-sm text-muted-foreground">Link another mailbox to track emails from multiple accounts</div>
              </button>
              
              <button
                type="button"
                onClick={() => alert("Logout: call your sign-out.")}
                className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent transition text-left"
              >
                <div className="font-medium">Log out</div>
                <div className="text-sm text-muted-foreground">Sign out of your current session</div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
