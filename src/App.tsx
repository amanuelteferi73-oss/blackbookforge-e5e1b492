import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimeDisplay } from "@/components/TimeDisplay";
import { Navigation } from "@/components/Navigation";
import { UserInitProvider } from "@/providers/UserInitProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CheckInPage from "./pages/CheckInPage";
import VaultPage from "./pages/VaultPage";
import RealityPage from "./pages/RealityPage";
import ProgressPage from "./pages/ProgressPage";
import FloorPage from "./pages/FloorPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserInitProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  {/* Global Time Display */}
                  <TimeDisplay />
                  
                  {/* Main Content with padding for fixed headers */}
                  <main className="pt-[73px] md:pt-[121px] pb-[72px] md:pb-0">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/check-in" element={<CheckInPage />} />
                      <Route path="/vault" element={<VaultPage />} />
                      <Route path="/reality" element={<RealityPage />} />
                      <Route path="/progress" element={<ProgressPage />} />
                      <Route path="/floor" element={<FloorPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  
                  {/* Navigation */}
                  <Navigation />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </UserInitProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
