import { ThreeDotsLoader } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { errorHandlingFetcher } from "@/lib/fetcher";
import {
  ConnectorIndexingStatus,
  FailedConnectorIndexingStatus,
  ValidStatuses,
} from "@/lib/types";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { useMemo, useState, Fragment } from "react";
import useSWR, { mutate } from "swr";
import { ReindexingProgressTable } from "@/components/embedding/ReindexingProgressTable";
import { ErrorCallout } from "@/components/ErrorCallout";
import {
  CloudEmbeddingModel,
  HostedEmbeddingModel,
} from "@/components/embedding/interfaces";
import { Connector } from "@/lib/connectors/connectors";
import { FailedReIndexAttempts } from "@/components/embedding/FailedReIndexAttempts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "@/components/icons/icons";

function ProgressSummary({ 
  reindexingProgress 
}: { 
  reindexingProgress: ConnectorIndexingStatus<any, any>[] 
}) {
  const statusCounts = useMemo(() => {
    const counts = {
      success: 0,
      in_progress: 0,
      not_started: 0,
      failed: 0,
      canceled: 0,
      completed_with_errors: 0,
      invalid: 0,
      total: reindexingProgress.length,
    };

    reindexingProgress.forEach(item => {
      const status = item.latest_index_attempt?.status || "not_started";
      counts[status as keyof typeof counts] += 1;
    });

    return counts;
  }, [reindexingProgress]);

  const completedPercentage = Math.round(
    ((statusCounts.success + statusCounts.failed + statusCounts.completed_with_errors + statusCounts.canceled) / 
    (statusCounts.total || 1)) * 100
  );

  return (
    <div className="mb-6 border rounded-lg p-4">
      <div className="pb-2">
        <h3 className="text-lg font-semibold">Reindexing Progress</h3>
        <p className="text-sm text-muted-foreground">Overall status of the embedding model upgrade</p>
      </div>
      <div>
        <div className="space-y-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-green-50 border rounded-full text-sm">
              <span className="mr-1 inline-block size-2 rounded-full bg-green-500" /> Success: {statusCounts.success}
            </span>
            <span className="px-2 py-1 bg-blue-50 border rounded-full text-sm">
              <span className="mr-1 inline-block size-2 rounded-full bg-blue-500" /> In Progress: {statusCounts.in_progress}
            </span>
            <span className="px-2 py-1 bg-yellow-50 border rounded-full text-sm">
              <span className="mr-1 inline-block size-2 rounded-full bg-yellow-500" /> Waiting: {statusCounts.not_started}
            </span>
            <span className="px-2 py-1 bg-red-50 border rounded-full text-sm">
              <span className="mr-1 inline-block size-2 rounded-full bg-red-500" /> Failed: {statusCounts.failed}
            </span>
            <span className="px-2 py-1 bg-gray-50 border rounded-full text-sm">
              <span className="mr-1 inline-block size-2 rounded-full bg-gray-500" /> Canceled: {statusCounts.canceled}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {completedPercentage}%</span>
              <span>{statusCounts.success} of {statusCounts.total} complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradingPage({
  futureEmbeddingModel,
}: {
  futureEmbeddingModel: CloudEmbeddingModel | HostedEmbeddingModel;
}) {
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const { data: connectors, isLoading: isLoadingConnectors } = useSWR<
    Connector<any>[]
  >("/api/manage/connector", errorHandlingFetcher, {
    refreshInterval: 5000, // 5 seconds
  });

  const {
    data: ongoingReIndexingStatus,
    isLoading: isLoadingOngoingReIndexingStatus,
    error: reindexingStatusError,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status?secondary_index=true",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const { data: failedIndexingStatus } = useSWR<
    FailedConnectorIndexingStatus[]
  >(
    "/api/manage/admin/connector/failed-indexing-status?secondary_index=true",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const onCancel = async () => {
    try {
      const response = await fetch("/api/search-settings/cancel-new-embedding", {
        method: "POST",
      });
      
      if (response.ok) {
        setNotification({
          message: "Successfully canceled embedding model upgrade",
          type: "success",
        });
        mutate("/api/search-settings/get-secondary-search-settings");
      } else {
        const errorText = await response.text();
        setNotification({
          message: `Failed to cancel embedding model update: ${errorText}`,
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const statusOrder: Record<ValidStatuses, number> = useMemo(
    () => ({
      invalid: 0,
      failed: 1,
      canceled: 2,
      completed_with_errors: 3,
      not_started: 4,
      in_progress: 5,
      success: 6,
    }),
    []
  );

  const sortedReindexingProgress = useMemo(() => {
    if (!ongoingReIndexingStatus) return [];
    
    return [...ongoingReIndexingStatus].sort((a, b) => {
      const statusComparison =
        statusOrder[a.latest_index_attempt?.status || "not_started"] -
        statusOrder[b.latest_index_attempt?.status || "not_started"];

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return (a.latest_index_attempt?.id || 0) - (b.latest_index_attempt?.id || 0);
    });
  }, [ongoingReIndexingStatus, statusOrder]);

  const isLoading = isLoadingConnectors || isLoadingOngoingReIndexingStatus;

  if (isLoading) {
    return <ThreeDotsLoader text="Loading upgrade status..." />;
  }

  if (reindexingStatusError) {
    return <ErrorCallout 
      errorTitle="Failed to fetch reindexing status"
      errorMsg="Please try refreshing the page or contact support if the problem persists."
    />;
  }

  return (
    <Fragment>
      {notification && (
        <div className={`mb-4 p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : 'ℹ'}
            </span>
            <p>{notification.message}</p>
            <button 
              className="ml-auto text-sm opacity-70 hover:opacity-100"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {isCancelling && (
        <Modal
          onOutsideClick={() => setIsCancelling(false)}
          title="Cancel Embedding Model Switch"
        >
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <p>Are you sure you want to cancel the upgrade to <strong>{futureEmbeddingModel.model_name}</strong>?</p>
              <p className="mt-2">
                Cancelling will revert to the previous model and all reindexing progress will be lost.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCancelling(false)}
              >
                No, Continue Upgrade
              </Button>
              <Button 
                onClick={onCancel} 
                variant="destructive"
              >
                Yes, Cancel Upgrade
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {futureEmbeddingModel && (
        <div className="space-y-8">
          <div className="bg-muted/40 border-border-weak rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-3">
              <InfoIcon className="text-primary size-5" />
              <Title className="!m-0 !text-lg">Embedding Model Upgrade in Progress</Title>
            </div>
            <Text className="text-muted-foreground">
              You&apos;re upgrading to <strong>{futureEmbeddingModel.model_name}</strong>. This process 
              requires reindexing all your existing data with the new model. Your search functionality 
              will continue working with the old model until the upgrade is complete.
            </Text>
          </div>

          <div className="flex items-center justify-between">
            <Title className="!m-0">Upgrade Status</Title>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelling(true)}
            >
              Cancel Upgrade
            </Button>
          </div>

          {connectors && connectors.length > 0 ? (
            <>
              {failedIndexingStatus && failedIndexingStatus.length > 0 && (
                <FailedReIndexAttempts 
                  failedIndexingStatuses={failedIndexingStatus}
                  setPopup={(spec) => {
                    if (spec && typeof spec === 'object' && 'message' in spec) {
                      setNotification({
                        message: spec.message,
                        type: (spec.type as "success" | "error" | "info") || "info"
                      });
                    }
                  }}
                />
              )}

              {sortedReindexingProgress && sortedReindexingProgress.length > 0 && (
                <div className="space-y-4">
                  <ProgressSummary reindexingProgress={sortedReindexingProgress} />
                  <Text className="text-muted-foreground">
                    The table below shows the re-indexing progress of all existing
                    connectors. Once all connectors have been re-indexed
                    successfully, the new model will be used for all search
                    queries. Until then, we will use the old model so that no
                    downtime is necessary during this transition.
                  </Text>

                  <ReindexingProgressTable
                    reindexingProgress={sortedReindexingProgress}
                  />
                </div>
              )}
            </>
          ) : (
            <Alert>
              <InfoIcon className="size-4" />
              <AlertTitle>No connectors found</AlertTitle>
              <AlertDescription>
                You don&apos;t have any connectors set up yet. The upgrade will be completed automatically.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Fragment>
  );
}