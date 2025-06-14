
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth';
import { SelectedComponentsProvider } from '@/shared/contexts/SelectedComponentsContext';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Components from '@/pages/Components';
import ComponentCreate from '@/pages/ComponentCreate';
import ComponentDetail from '@/pages/ComponentDetail';
import ComponentEdit from '@/pages/ComponentEdit';
import UserComponentEdit from '@/pages/UserComponentEdit';
import AdminPanel from '@/pages/AdminPanel';
import UserManagement from '@/pages/UserManagement';
import UserProfile from '@/pages/UserProfile';
import NotFound from '@/pages/NotFound';

// Create a QueryClient instance with improved performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 5 * 60 * 1000, // 5 minutes cache time
    },
  },
});

// Create a function component for App
const App: React.FC = () => {
  // Set default language if not already set
  useEffect(() => {
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'en');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SelectedComponentsProvider>
            <Toaster position="bottom-right" />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Components accessible without login */}
              <Route path="/components" element={<Components />} />
              <Route path="/component/:id" element={<ComponentDetail />} />
              {/* Protected routes */}
              <Route path="/components/new" element={
                <ProtectedRoute>
                  <ComponentCreate />
                </ProtectedRoute>
              } />
              <Route path="/component/edit/:id" element={
                <ProtectedRoute adminOnly>
                  <ComponentEdit />
                </ProtectedRoute>
              } />
              <Route path="/my-component/edit/:id" element={
                <ProtectedRoute ownerOnly>
                  <UserComponentEdit />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SelectionFloatingButton />
          </SelectedComponentsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
