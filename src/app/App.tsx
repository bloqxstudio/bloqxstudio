
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth';
import { SelectedComponentsProvider } from '@/shared/contexts/SelectedComponentsContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthRedirect from '@/components/AuthRedirect';

// Pages
import Components from '@/pages/Components';
import ComponentDetail from '@/pages/ComponentDetail';
import ComponentCreate from '@/pages/ComponentCreate';
import ComponentEdit from '@/pages/ComponentEdit';
import UserComponentEdit from '@/pages/UserComponentEdit';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserProfile from '@/pages/UserProfile';
import AdminPanel from '@/pages/AdminPanel';
import UserManagement from '@/pages/UserManagement';
import WordPressIntegration from '@/pages/WordPressIntegration';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import NotFound from '@/pages/NotFound';

// Ultra-fast configuration with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15 * 60 * 1000, // 15 minutes - muito mais agressivo
      gcTime: 30 * 60 * 1000, // 30 minutes - manter dados em cache por mais tempo
      refetchOnMount: false, // Não refetch se dados estão no cache
      refetchOnReconnect: false, // Não refetch automaticamente ao reconectar
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SelectedComponentsProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<AuthRedirect />} />
                <Route path="/components" element={
                  <ProtectedRoute>
                    <Components />
                  </ProtectedRoute>
                } />
                <Route path="/component/:id" element={<ComponentDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/components/new" element={
                  <ProtectedRoute>
                    <ComponentCreate />
                  </ProtectedRoute>
                } />
                <Route path="/components/:id/edit" element={
                  <ProtectedRoute>
                    <UserComponentEdit />
                  </ProtectedRoute>
                } />
                
                {/* WordPress Integration - liberado para todos os usuários autenticados */}
                <Route path="/wordpress" element={
                  <ProtectedRoute>
                    <WordPressIntegration />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
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
                <Route path="/admin/components/:id/edit" element={
                  <ProtectedRoute adminOnly>
                    <ComponentEdit />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster position="top-right" />
          </Router>
        </SelectedComponentsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
