import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const PaginationRoot = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
PaginationRoot.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      disabled && "pointer-events-none opacity-50",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>上一页</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>下一页</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">更多页码</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// 自定义分页组件
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// 包装现有组件，创建一个自定义组件
function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // 生成页码链接
  const generatePaginationItems = () => {
    // 计算显示的页码范围
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const pages = [];
    
    // 添加"首页"链接（如果不在第一页）
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      // 添加省略号（如果首页和起始页之间有间隔）
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // 添加页码链接
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 添加省略号（如果结束页和末页之间有间隔）
    if (endPage < totalPages - 1) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // 添加"末页"链接（如果不在最后一页）
    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };
  
  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
            disabled={currentPage <= 1}
          />
        </PaginationItem>
        
        {generatePaginationItems()}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} 