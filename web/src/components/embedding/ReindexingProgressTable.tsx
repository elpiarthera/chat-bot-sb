import { useMemo } from 'react';
import { ConnectorIndexingStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ReindexingProgressTableProps {
  reindexingProgress: ConnectorIndexingStatus<any, any>[];
}

export function ReindexingProgressTable({ reindexingProgress }: ReindexingProgressTableProps) {
  const sortedProgress = useMemo(() => {
    return [...reindexingProgress].sort((a, b) => {
      // Sort by status priority
      const statusOrder = {
        in_progress: 0,
        not_started: 1,
        success: 2,
        completed_with_errors: 3,
        failed: 4,
        canceled: 5,
        invalid: 6
      };
      
      const aStatus = a.latest_index_attempt?.status || 'not_started';
      const bStatus = b.latest_index_attempt?.status || 'not_started';
      
      return statusOrder[aStatus as keyof typeof statusOrder] - statusOrder[bStatus as keyof typeof statusOrder];
    });
  }, [reindexingProgress]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Connector</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProgress.map((item) => {
            const status = item.latest_index_attempt?.status || 'not_started';
            const startedAt = item.latest_index_attempt?.started_at ? 
              formatDistanceToNow(new Date(item.latest_index_attempt.started_at), { addSuffix: true }) : 
              'Not started';
            const completedAt = item.latest_index_attempt?.completed_at ? 
              formatDistanceToNow(new Date(item.latest_index_attempt.completed_at), { addSuffix: true }) : 
              '-';
            
            return (
              <TableRow key={item.connector_id}>
                <TableCell className="font-medium">
                  {item.connector?.name || item.connector_id}
                </TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell>
                  {item.latest_index_attempt?.num_docs_indexed || 0} documents
                </TableCell>
                <TableCell>{startedAt}</TableCell>
                <TableCell>{completedAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'not_started':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed_with_errors':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'canceled':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      case 'failed':
        return 'Failed';
      case 'completed_with_errors':
        return 'Completed with Errors';
      case 'canceled':
        return 'Canceled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  return (
    <Badge variant="outline" className={getVariant()}>
      {getLabel()}
    </Badge>
  );
} 