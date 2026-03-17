import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Lucros from "@/pages/Lucros";
import Operacoes from "@/pages/Operacoes";
import Configuracao from "@/pages/Configuracao";
import Monitoramento from "@/pages/Monitoramento";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operacoes"
              element={
                <ProtectedRoute>
                  <Operacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lucros"
              element={
                <ProtectedRoute>
                  <Lucros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracao"
              element={
                <ProtectedRoute>
                  <Configuracao />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoramento"
              element={
                <ProtectedRoute>
                  <Monitoramento />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
