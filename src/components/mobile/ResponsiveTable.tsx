import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    mobileLabel?: string;
    hideOnMobile?: boolean;
  }[];
  mobileCardRender?: (item: T) => React.ReactNode;
  className?: string;
}

/**
 * Responsive table component
 * Shows cards on mobile, table on desktop
 */
export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  mobileCardRender,
  className,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Card view
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((item, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-4 space-y-3">
              {mobileCardRender ? (
                mobileCardRender(item)
              ) : (
                columns
                  .filter(col => !col.hideOnMobile)
                  .map((column) => (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="font-semibold text-muted-foreground text-sm">
                        {column.mobileLabel || column.header}:
                      </span>
                      <span className="text-right text-sm">
                        {column.render ? column.render(item) : item[column.key]}
                      </span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop: Table view
  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.hideOnMobile ? 'hidden md:table-cell' : ''}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.hideOnMobile ? 'hidden md:table-cell' : ''}
                >
                  {column.render ? column.render(item) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
