"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "./utils";
import { Skeleton } from "./skeleton";
import { Checkbox } from "./checkbox";
import { Button } from "./button";

/**
 * Data Table component with sorting, selection, pagination, and responsive design
 * 
 * @example
 * // Basic usage
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * 
 * // With sorting
 * <TableHead sortable sortDirection="asc" onSort={() => {}}>
 *   Name
 * </TableHead>
 * 
 * // With selection
 * <TableRow selected>
 *   <TableCell><Checkbox checked /></TableCell>
 * </TableRow>
 */

// Table Container
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// Table Header
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "border-b border-gray-200 dark:border-gray-800",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

// Table Body
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

// Table Footer
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-gray-200 bg-gray-50 font-medium dark:border-gray-800 dark:bg-gray-900",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// Table Row
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-gray-200 transition-colors dark:border-gray-800",
        "hover:bg-gray-50/50 dark:hover:bg-gray-800/50",
        selected && "bg-blue-50 hover:bg-blue-50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// Table Head with sorting support
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => {
    const content = (
      <>
        {children}
        {sortable && (
          <span className="ml-1 inline-flex">
            {sortDirection === "asc" && <ChevronUp className="h-4 w-4" />}
            {sortDirection === "desc" && <ChevronDown className="h-4 w-4" />}
            {!sortDirection && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
          </span>
        )}
      </>
    );

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400",
          "transition-colors",
          sortable && "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300",
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {content}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

// Table Cell
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// Table Caption
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Empty State
export interface TableEmptyProps {
  /** Title for the empty state */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button or element */
  action?: React.ReactNode;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Number of columns (for colspan) */
  colSpan?: number;
}

function TableEmpty({
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  action,
  icon,
  colSpan = 1,
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-48 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          {icon && (
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              {icon}
            </div>
          )}
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          <div className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  );
}

// Loading State with Skeleton
export interface TableLoadingProps {
  /** Number of columns */
  columns: number;
  /** Number of rows to show */
  rows?: number;
  /** Whether selection is enabled (adds extra column) */
  withSelection?: boolean;
}

function TableLoading({ columns, rows = 5, withSelection = false }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {withSelection && (
            <TableCell>
              <Skeleton className="h-4 w-4" />
            </TableCell>
          )}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-3/4" : "w-full"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Pagination
export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
}

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
      {/* Info */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>

        {getPageNumbers().map((pageNum, index) =>
          pageNum === "..." ? (
            <span
              key={index}
              className="px-2 text-gray-400 dark:text-gray-600"
            >
              ...
            </span>
          ) : (
            <Button
              key={index}
              variant={page === pageNum ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNum as number)}
              className="min-w-[2rem]"
            >
              {pageNum}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Mobile Card View for responsive tables
export interface TableMobileCardProps {
  children: React.ReactNode;
  className?: string;
}

function TableMobileCard({ children, className }: TableMobileCardProps) {
  return (
    <div className={cn("block sm:hidden", className)}>
      {children}
    </div>
  );
}

// Mobile Card Item
export interface TableMobileCardItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function TableMobileCardItem({
  children,
  className,
  onClick,
}: TableMobileCardItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900",
        onClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
        "mb-2 last:mb-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableLoading,
  Pagination,
  TableMobileCard,
  TableMobileCardItem,
};
