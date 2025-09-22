import React, { useEffect, useState } from "react";
import { Moon, Sun, LogIn, LogOut, UserPlus, Settings as SettingsIcon, Palette, User, Shield, Mail, Bell, Eye, Database, Download, Trash2, Key, Globe, Lock, Zap, Star, Heart } from "lucide-react";

/* Floating glass morphism card component */
function GlassCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void; }) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/10 
        border border-white/20 dark:border-white/10 shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50
        hover:shadow-3xl hover:scale-[1.01] transition-all duration-500
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}

/* Enhanced toggle switch component */
function ToggleSwitch({ enabled, onChange, leftIcon: LeftIcon, rightIcon: RightIcon }: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
  leftIcon: any; 
  rightIcon: any; 
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-500 ease-in-out transform hover:scale-105
        ${enabled 
          ? 'bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 shadow-lg shadow-purple-500/30' 
          : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 shadow-lg shadow-gray-500/20'
        }
      `}
    >
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-in-out transform
          flex items-center justify-center text-xs backdrop-blur-sm
          ${enabled 
            ? 'translate-x-8 bg-white text-purple-600 shadow-lg' 
            : 'translate-x-1 bg-white text-gray-600 shadow-lg'
          }
        `}
      >
        {enabled ? <RightIcon className="h-3 w-3" /> : <LeftIcon className="h-3 w-3" />}
      </div>
    </button>
  );
}

/* Enhanced theme toggle with premium effects */
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
    <GlassCard className="p-6 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
          </div>
        </div>
        <ToggleSwitch 
          enabled={isDark} 
          onChange={apply}
          leftIcon={Sun}
          rightIcon={Moon}
        />
      </div>
    </GlassCard>
  );
}

/* Notification Settings Component */
function NotificationSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [aiSummaries, setAiSummaries] = useState(false);

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Notifications</h3>
          <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div>
            <p className="font-semibold">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Get notified when emails are read</p>
          </div>
          <ToggleSwitch enabled={emailNotifs} onChange={setEmailNotifs} leftIcon={Mail} rightIcon={Bell} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div>
            <p className="font-semibold">Read Receipt Alerts</p>
            <p className="text-xs text-muted-foreground">Instant notifications for email opens</p>
          </div>
          <ToggleSwitch enabled={readReceipts} onChange={setReadReceipts} leftIcon={Eye} rightIcon={Zap} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <div>
            <p className="font-semibold">AI Summary Notifications</p>
            <p className="text-xs text-muted-foreground">Get notified of new AI summaries</p>
          </div>
          <ToggleSwitch enabled={aiSummaries} onChange={setAiSummaries} leftIcon={Star} rightIcon={Zap} />
        </div>
      </div>
    </GlassCard>
  );
}

/* Privacy & Security Settings */
function PrivacySettings() {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [encryption, setEncryption] = useState(true);

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl text-white shadow-lg">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Privacy & Security</h3>
          <p className="text-sm text-muted-foreground">Control your data and privacy settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div>
            <p className="font-semibold">Email Tracking</p>
            <p className="text-xs text-muted-foreground">Enable read receipts and tracking pixels</p>
          </div>
          <ToggleSwitch enabled={trackingEnabled} onChange={setTrackingEnabled} leftIcon={Eye} rightIcon={Zap} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div>
            <p className="font-semibold">Data Collection</p>
            <p className="text-xs text-muted-foreground">Allow analytics for app improvement</p>
          </div>
          <ToggleSwitch enabled={dataCollection} onChange={setDataCollection} leftIcon={Database} rightIcon={Star} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div>
            <p className="font-semibold">End-to-End Encryption</p>
            <p className="text-xs text-muted-foreground">Secure your sensitive data</p>
          </div>
          <ToggleSwitch enabled={encryption} onChange={setEncryption} leftIcon={Lock} rightIcon={Key} />
        </div>
      </div>
    </GlassCard>
  );
}

/* Data Management Section */
function DataManagement() {
  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Data Management</h3>
          <p className="text-sm text-muted-foreground">Manage your stored data and exports</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:scale-105 transition-all duration-300 text-left">
          <div className="flex items-center gap-3 mb-2">
            <Download className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Export Data</span>
          </div>
          <p className="text-xs text-muted-foreground">Download all your email tracking data</p>
        </button>

        <button className="p-4 rounded-2xl bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20 hover:scale-105 transition-all duration-300 text-left">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span className="font-semibold">Clear Data</span>
          </div>
          <p className="text-xs text-muted-foreground">Remove all stored tracking information</p>
        </button>
      </div>
    </GlassCard>
  );
}

/* Premium action cards with floating effects */
function AccountActionCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  variant = "default" 
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
}) {
  const variants = {
    default: "from-slate-50/80 to-gray-100/80 dark:from-slate-800/50 dark:to-slate-700/50",
    primary: "from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30",
    danger: "from-red-50/80 to-orange-50/80 dark:from-red-900/30 dark:to-orange-900/30"
  };

  const iconColors = {
    default: "from-slate-500 via-gray-500 to-slate-600",
    primary: "from-blue-500 via-purple-500 to-indigo-600",
    danger: "from-red-500 via-orange-500 to-pink-600"
  };

  return (
    <GlassCard className={`group p-6 cursor-pointer hover:bg-gradient-to-br ${variants[variant]}`} onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-2xl bg-gradient-to-br text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 ${iconColors[variant]}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </GlassCard>
  );
}

/* Privacy & Security Settings */
function PrivacySettings() {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [encryption, setEncryption] = useState(true);

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl text-white shadow-lg">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Privacy & Security</h3>
          <p className="text-sm text-muted-foreground">Control your data and privacy settings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div>
            <p className="font-semibold">Email Tracking</p>
            <p className="text-xs text-muted-foreground">Enable read receipts and tracking pixels</p>
          </div>
          <ToggleSwitch enabled={trackingEnabled} onChange={setTrackingEnabled} leftIcon={Eye} rightIcon={Zap} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div>
            <p className="font-semibold">Data Collection</p>
            <p className="text-xs text-muted-foreground">Allow analytics for app improvement</p>
          </div>
          <ToggleSwitch enabled={dataCollection} onChange={setDataCollection} leftIcon={Database} rightIcon={Star} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div>
            <p className="font-semibold">End-to-End Encryption</p>
            <p className="text-xs text-muted-foreground">Secure your sensitive data</p>
          </div>
          <ToggleSwitch enabled={encryption} onChange={setEncryption} leftIcon={Lock} rightIcon={Key} />
        </div>
      </div>
    </GlassCard>
  );
}

/* Data Management Section */
function DataManagement() {
  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Data Management</h3>
          <p className="text-sm text-muted-foreground">Manage your stored data and exports</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:scale-105 transition-all duration-300 text-left">
          <div className="flex items-center gap-3 mb-2">
            <Download className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Export Data</span>
          </div>
          <p className="text-xs text-muted-foreground">Download all your email tracking data</p>
        </button>

        <button className="p-4 rounded-2xl bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20 hover:scale-105 transition-all duration-300 text-left">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span className="font-semibold">Clear Data</span>
          </div>
          <p className="text-xs text-muted-foreground">Remove all stored tracking information</p>
        </button>
      </div>
    </GlassCard>
  );
}

export default function Settings() {
  const onLogin = () => alert("Login: connect to your auth flow.");
  const onLogout = () => alert("Logout: call your sign-out.");
  const onAddAccount = () => alert("Add account: start OAuth/link flow.");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 dark:from-gray-950 dark:via-indigo-950/50 dark:to-purple-950/30 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Premium page header with floating animation */}
        <div className="mb-12 text-center animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-4 mb-6 p-4 bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl text-white shadow-2xl animate-pulse">
              <SettingsIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-lg text-muted-foreground mt-2">Customize your premium MailSenseAI experience</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Appearance Section */}
          <section className="space-y-6 animate-in slide-in-from-left duration-700 delay-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl text-white shadow-xl">
                <Palette className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Appearance</h2>
            </div>
            <ThemeToggle />
          </section>

          {/* Notifications Section */}
          <section className="space-y-6 animate-in slide-in-from-right duration-700 delay-200">
            <NotificationSettings />
          </section>

          {/* Privacy & Security Section */}
          <section className="space-y-6 animate-in slide-in-from-left duration-700 delay-300">
            <PrivacySettings />
          </section>

          {/* Account Management Section */}
          <section className="space-y-6 animate-in slide-in-from-right duration-700 delay-400">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl text-white shadow-xl">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Account Management</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              <AccountActionCard
                icon={LogIn}
                title="Sign In"
                description="Connect to your email account and start advanced tracking with premium features"
                onClick={onLogin}
                variant="primary"
              />
              
              <AccountActionCard
                icon={UserPlus}
                title="Add Account"
                description="Link multiple email accounts for comprehensive cross-platform tracking and analytics"
                onClick={onAddAccount}
                variant="default"
              />
              
              <AccountActionCard
                icon={LogOut}
                title="Sign Out"
                description="Securely disconnect from your current session with full data protection"
                onClick={onLogout}
                variant="danger"
              />
            </div>
          </section>

          {/* Data Management Section */}
          <section className="space-y-6 animate-in slide-in-from-left duration-700 delay-500">
            <DataManagement />
          </section>

          {/* Premium Status Cards */}
          <section className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white shadow-xl">
                <Star className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Premium Status</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard className="p-6 hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-cyan-50/30 hover:dark:from-blue-900/10 hover:dark:to-cyan-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-xl">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email Tracking</h3>
                    <p className="text-sm text-muted-foreground">Active Premium</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 hover:bg-gradient-to-br hover:from-green-50/30 hover:to-emerald-50/30 hover:dark:from-green-900/10 hover:dark:to-emerald-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white shadow-xl">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Security</h3>
                    <p className="text-sm text-muted-foreground">Enterprise Grade</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-pink-50/30 hover:dark:from-purple-900/10 hover:dark:to-pink-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white shadow-xl">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Demo User</h3>
                    <p className="text-sm text-muted-foreground">Premium Access</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

