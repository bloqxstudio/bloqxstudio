
import React from 'react';
import Navbar from '@/components/Navbar';
import ComponentsWithCategories from '@/components/components/ComponentsWithCategories';

const Components = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />
      <ComponentsWithCategories />
    </div>
  );
};

export default Components;
