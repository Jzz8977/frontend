import { FileQuestion } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

interface ResourceNotFoundProps {
  resourceName?: string;
  resourceId?: string;
  onBack?: () => void;
  className?: string;
  showBackButton?: boolean;
}

export function ResourceNotFound({
  resourceName = "资源",
  resourceId,
  onBack,
  className = "",
  showBackButton = true,
}: ResourceNotFoundProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 p-3">
            <FileQuestion className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <CardTitle className="text-xl font-medium">
          未找到{resourceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground pb-2">
        <p>
          {resourceId 
            ? `ID 为 "${resourceId}" 的${resourceName}不存在或已被删除。`
            : `请求的${resourceName}不存在或已被删除。`}
        </p>
      </CardContent>
      {showBackButton && onBack && (
        <CardFooter className="flex justify-center pt-0">
          <Button variant="outline" size="sm" onClick={onBack}>
            返回
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 