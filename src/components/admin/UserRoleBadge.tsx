
import React from 'react';
import { Shield, User } from 'lucide-react';

interface UserRoleBadgeProps {
  role: string;
}

const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  if (role === 'admin') {
    return (
      <div className="flex items-center">
        <Shield className="h-4 w-4 text-primary mr-2" />
        <span className="font-medium">Administrator</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <User className="h-4 w-4 text-muted-foreground mr-2" />
      <span>User</span>
    </div>
  );
};

export default UserRoleBadge;
