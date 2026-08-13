import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/Auth";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import ComingSoonPage from "./pages/ComingSoon";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Opening Duely…
        </p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices/new" 
            element={
              <ProtectedRoute>
                <NewInvoice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices/:id" 
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            } 
          />

          {/* Missing Navigation Routes -> Clean Coming Soon Pages */}
          <Route 
            path="/quibot" 
            element={
              <ProtectedRoute>
                <ComingSoonPage 
                  title="Quibot AI Assistant" 
                  description="An autonomous AI agent to analyze payment histories, draft client communications, and optimize cash flow."
                  icon={Sparkles}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estimates" 
            element={
              <ProtectedRoute>
                <ComingSoonPage 
                  title="Estimates & Quotes" 
                  description="Create, send, and convert client project estimates into active invoices with one click."
                  icon={FileSpreadsheet}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receipts" 
            element={
              <ProtectedRoute>
                <ComingSoonPage 
                  title="Payment Receipts" 
                  description="Automatically issue branded proof of payment receipts whenever an invoice is settled."
                  icon={Receipt}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/revenue-forecast" 
            element={
              <ProtectedRoute>
                <ComingSoonPage 
                  title="Revenue Forecast" 
                  description="Predict upcoming income streams based on active invoices, recurring clients, and historical payout dates."
                  icon={TrendingUp}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tutorial" 
            element={
              <ProtectedRoute>
                <ComingSoonPage 
                  title="Duely Workspace Tutorial" 
                  description="Learn best practices for automated invoice chasing, custom branding setups, and payment notifications."
                  icon={GraduationCap}
                />
              </ProtectedRoute>
            } 
          />

          {/* Settings & Profile Pages */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/invoices/new" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
