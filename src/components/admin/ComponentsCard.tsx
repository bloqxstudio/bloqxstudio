
import React from 'react';
import { Component, Category } from '@/core/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import ComponentsTable from './ComponentsTable';
import EmptyComponentsState from './EmptyComponentsState';

interface ComponentsCardProps {
  components: Component[];
  categories: Category[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const ComponentsCard = ({ components, categories, isLoading, onDelete }: ComponentsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Components ({components.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : components.length > 0 ? (
          <ComponentsTable 
            components={components} 
            categories={categories} 
            onDelete={onDelete} 
          />
        ) : (
          <EmptyComponentsState />
        )}
      </CardContent>
    </Card>
  );
};

export default ComponentsCard;
