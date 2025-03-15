import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import GenerateApi from "@/pages/generate-api";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import Chat from "./pages/chat";
import TestBotChat from "./pages/test-bot-chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/generate-api" component={GenerateApi} />
      <ProtectedRoute path="/chat" component={Chat} />
      <ProtectedRoute path="/test-bot-chat" component={TestBotChat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <Router />
        <Footer />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
