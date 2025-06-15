import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { LoginForm } from '@/features/auth';
import Navbar from '@/components/Navbar';
const Login = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/components');
    }
  }, [user, navigate]);

  // Only render the form if user is not logged in
  if (user) {
    return null; // Don't render anything while redirecting
  }
  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            {/* Logo */}
            
            
            <h1 className="text-3xl font-bold mb-2">Sign In</h1>
            <p className="text-muted-foreground">
              Sign in to your account to access components
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>;
};
export default Login;