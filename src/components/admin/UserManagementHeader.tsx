
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface UserManagementHeaderProps {
  onRefresh: () => void;
}

const UserManagementHeader = ({ onRefresh }: UserManagementHeaderProps) => {
  return (
    <div className="mb-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Panel
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold tracking-tighter">User Management</h1>
      <p className="text-muted-foreground mt-1">
        Manage users and roles
      </p>
    </div>
  );
};

export default UserManagementHeader;
