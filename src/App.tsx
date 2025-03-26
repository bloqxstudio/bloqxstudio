
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useState } from "react";
import Index from "./pages/Index";
import Components from "./pages/Components";
import ComponentDetail from "./pages/ComponentDetail";
import ComponentCreate from "./pages/ComponentCreate";
import ComponentEdit from "./pages/ComponentEdit";
import AdminPanel from "./pages/AdminPanel";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { Skeleton } from "./components/ui/skeleton";
import { Progress } from "./components/ui/progress";

// Create a fallback loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-center">Loading Application...</h2>
      <Progress value={80} className="h-2" />
      <p className="text-center text-muted-foreground">Please wait while we set up the environment</p>
    </div>
  </div>
);

// Create an error boundary component
const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
    <div className="w-full max-w-md space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-red-600">Something went wrong</h2>
      <p className="text-center">We encountered an error while loading the application.</p>
      {error && <p className="p-2 bg-red-50 text-red-800 rounded text-sm">{error.message}</p>}
      <div className="flex justify-center">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Reload Application
        </button>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [error, setError] = useState<Error | null>(null);

  // Error handler
  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/components" element={<Components />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/component/:id" element={<ComponentDetail />} />
                <Route path="/components/new" element={
                  <ProtectedRoute adminOnly>
                    <ComponentCreate />
                  </ProtectedRoute>
                } />
                <Route path="/components/edit/:id" element={
                  <ProtectedRoute adminOnly>
                    <ComponentEdit />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
