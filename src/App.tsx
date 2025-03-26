import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Components from '@/pages/Components';
import ComponentCreate from '@/pages/ComponentCreate';
import ComponentDetail from '@/pages/ComponentDetail';
import ComponentEdit from '@/pages/ComponentEdit';
import AdminPanel from '@/pages/AdminPanel';
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/components" element={<Components />} />
            <Route path="/components/new" element={
              <ProtectedRoute>
                <ComponentCreate />
              </ProtectedRoute>
            } />
            <Route path="/component/:id" element={<ComponentDetail />} />
            <Route path="/component/edit/:id" element={
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
