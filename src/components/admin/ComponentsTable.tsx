
import React from 'react';
import { Link } from 'react-router-dom';
import { Component, Category } from '@/core/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button
} from '@/components/ui';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

interface ComponentsTableProps {
  components: Component[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const ComponentsTable = ({ components, categories, onDelete }: ComponentsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => (
            <TableRow key={component.id}>
              <TableCell className="font-medium">{component.title}</TableCell>
              <TableCell>
                {categories.find(c => c.id === component.category)?.name || component.category}
              </TableCell>
              <TableCell>
                {component.visibility === 'public' ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Eye className="h-3 w-3 mr-1" /> Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <EyeOff className="h-3 w-3 mr-1" /> Private
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(component.created_at).toLocaleDateString('en-US')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/component/${component.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/components/edit/${component.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(component.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComponentsTable;
