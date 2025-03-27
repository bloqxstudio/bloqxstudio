
import React from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderImageProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  text?: string;
}

const PlaceholderImage = ({ 
  className, 
  aspectRatio = 'video', 
  text = 'Image', 
  ...props 
}: PlaceholderImageProps) => {
  const aspectRatioClass = {
    'square': 'aspect-square',
    'video': 'aspect-video',
    'portrait': 'aspect-[3/4]',
    'wide': 'aspect-[16/9]',
    'auto': 'aspect-auto',
  }[aspectRatio];

  return (
    <div 
      className={cn(
        'bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden border border-blue-100',
        aspectRatioClass,
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-8 h-8 text-blue-300 mb-2"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="text-xs text-blue-400">{text}</span>
      </div>
    </div>
  );
};

export { PlaceholderImage };
