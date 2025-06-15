
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ComponentCreateForm from '@/components/forms/ComponentCreateForm';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';

const ComponentCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast.error('You need to be logged in to access this page');
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/components');
  };

  // Only render the form if user is logged in
  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Create New Component</h1>
          <p className="text-muted-foreground mt-1">
            Paste an Elementor JSON to get started
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
      
      <ComponentCreateForm />
    </PageWrapper>
  );
};

export default ComponentCreate;
