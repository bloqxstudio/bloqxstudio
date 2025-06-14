
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/core/api';
import { Category } from '@/core/types/database';

interface ComponentBreadcrumbProps {
  category?: string;
  title: string;
}

const ComponentBreadcrumb: React.FC<ComponentBreadcrumbProps> = ({ category, title }) => {
  // Get category name if we have a category ID
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 60 * 1000,
    enabled: !!category, // Only run this query if we have a category ID
  });

  const categoryName = category 
    ? (categories as Category[]).find(c => c.id === category)?.name || category
    : undefined;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/components">Componentes</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {categoryName && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/components?category=${category}`}>{categoryName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ComponentBreadcrumb;
