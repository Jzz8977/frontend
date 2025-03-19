import React from 'react';
import { FolderSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataNotFoundProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function DataNotFound({ 
  title = '未找到数据', 
  description = '没有匹配的结果或数据列表为空', 
  onRetry, 
  showRetry = true 
}: DataNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="rounded-full bg-muted p-3 mb-3">
        <FolderSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-2 text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md text-center">
        {description}
      </p>
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="mt-4 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      )}
    </div>
  );
} 