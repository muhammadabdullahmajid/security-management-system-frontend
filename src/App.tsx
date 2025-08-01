import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AuthGuard from "./components/AuthGuard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Guards from "./pages/Guards";
import Clients from "./pages/Clients";
import DutyAssignment from "./pages/DutyAssignment";
import Salary from "./pages/Salary";
import Inventory from "./pages/Inventory";
import ClientGuard from "./pages/ClientGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="guards" element={<Guards />} />
            <Route path="clients" element={<Clients />} />
            <Route path="duty-assignment" element={<DutyAssignment />} />
            <Route path="salary" element={<Salary />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="client-guard" element={<ClientGuard />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;