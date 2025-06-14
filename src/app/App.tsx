
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { SelectedComponentsProvider } from "@/shared/contexts/SelectedComponentsContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Components from "@/pages/Components";
import ComponentDetail from "@/pages/ComponentDetail";
import ComponentCreate from "@/pages/ComponentCreate";
import ComponentEdit from "@/pages/ComponentEdit";
import UserComponentEdit from "@/pages/UserComponentEdit";
import UserProfile from "@/pages/UserProfile";
import UserManagement from "@/pages/UserManagement";
import AdminPanel from "@/pages/AdminPanel";
import WordPressIntegration from "@/pages/WordPressIntegration";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SelectedComponentsProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/components" element={<Components />} />
                <Route path="/components/:id" element={<ComponentDetail />} />
                <Route path="/wordpress" element={<WordPressIntegration />} />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <ComponentCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/components/:id/edit"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ComponentEdit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/components/:id/edit"
                  element={
                    <ProtectedRoute>
                      <UserComponentEdit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SelectedComponentsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
