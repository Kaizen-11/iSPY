// client/src/App.tsx
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "./pages/dashboard";
import Compose from "./pages/compose";
import SentEmails from "./pages/sent-emails";
import AiSummaries from "./pages/ai-summaries";
import SettingsPage from "./pages/settings-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/compose" component={Compose} />
      <Route path="/sent" component={SentEmails} />
      <Route path="/summaries" component={AiSummaries} />
      <Route path="/settings" component={SettingsPage} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <main className="min-h-screen dashboard-hero">
          <Toaster />
          <Router />
        </main>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
