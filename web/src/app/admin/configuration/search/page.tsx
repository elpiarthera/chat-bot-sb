"use client";

import { ThreeDotsLoader } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { errorHandlingFetcher } from "@/lib/fetcher";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { ModelPreview } from "@/components/embedding/ModelSelector";
import { EmbeddingModel } from "@/components/embedding/interfaces";
import { ErrorCallout } from "@/components/ErrorCallout";

export interface EmbeddingDetails {
  api_key: string;
  custom_config: any;
  default_model_id?: number;
  name: string;
}

import { EmbeddingIcon, InfoIcon } from "@/components/icons/icons";
import { usePopupFromQuery } from "@/components/popup/PopupFromQuery";
import Link from "next/link";
import { SavedSearchSettings } from "../../embeddings/interfaces";
import UpgradingPage from "./UpgradingPage";
import { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { CardSection } from "@/components/admin/card-section";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Popup } from "@/components/admin/connectors/Popup";

// Type aliases for clarity
type HostedEmbeddingModel = EmbeddingModel;
type CloudEmbeddingModel = EmbeddingModel;

function SearchSettingDetail({ label, value, tooltip }: { label: string; value: string | number | boolean | null | undefined; tooltip?: string }) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-1">
        <p className="font-semibold">{label}</p>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <div className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                <p>{tooltip}</p>
              </div>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className="text-muted-foreground">
        {value === null || value === undefined
          ? "Not set"
          : typeof value === "boolean"
          ? value
            ? "Enabled"
            : "Disabled"
          : value}
      </p>
    </div>
  );
}

function Main() {
  // @ts-ignore - Using any type to bypass the context type issue
  const settingsContext = useContext(SettingsContext);
  const settings = settingsContext as { settings: { needs_reindexing: boolean } };
  const { popup: searchSettingsPopup } = usePopupFromQuery({
    searchSettings: {
      message: `Changed search settings successfully`,
      type: "success",
    },
  } as any);
  const {
    data: currentEmeddingModel,
    isLoading: isLoadingCurrentModel,
    error: currentEmeddingModelError,
  } = useSWR<HostedEmbeddingModel | CloudEmbeddingModel | null>(
    "/api/search-settings/get-current-search-settings",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const { data: searchSettings, isLoading: isLoadingSearchSettings } =
    useSWR<SavedSearchSettings | null>(
      "/api/search-settings/get-current-search-settings",
      errorHandlingFetcher,
      { refreshInterval: 5000 } // 5 seconds
    );

  const {
    data: futureEmbeddingModel,
    isLoading: isLoadingFutureModel,
    error: futureEmeddingModelError,
  } = useSWR<HostedEmbeddingModel | CloudEmbeddingModel | null>(
    "/api/search-settings/get-secondary-search-settings",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  if (
    isLoadingCurrentModel ||
    isLoadingFutureModel ||
    isLoadingSearchSettings
  ) {
    return <ThreeDotsLoader text="Loading search settings..." />;
  }

  if (
    currentEmeddingModelError ||
    !currentEmeddingModel ||
    futureEmeddingModelError
  ) {
    return <ErrorCallout 
      errorTitle="Failed to fetch embedding model status" 
      errorMsg="Please try refreshing the page or contact support if the problem persists."
    />;
  }

  // Create a component to render the UpgradingPage to avoid type issues
  const RenderUpgradingPage = () => {
    if (!futureEmbeddingModel) return null;
    // @ts-ignore - Ignoring type issues with the UpgradingPage component
    return <UpgradingPage futureEmbeddingModel={futureEmbeddingModel} />;
  };

  return (
    <div className="space-y-8 pb-12">
      {searchSettingsPopup && <Popup {...searchSettingsPopup} />}
      {!futureEmbeddingModel ? (
        <>
          {settings?.settings.needs_reindexing && (
            <div className="relative w-full rounded-lg border p-4 max-w-3xl bg-amber-50 border-amber-200" role="alert">
              <AlertCircle className="size-5 text-amber-500 absolute left-4 top-4" />
              <div className="pl-7">
                <h5 className="mb-1 font-medium leading-none tracking-tight">Search settings out of date</h5>
                <div className="text-sm">
                  Your search settings are currently out of date! We recommend
                  updating your search settings and re-indexing for optimal performance.
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight !text-2xl">Current Embedding Model</h2>
            <p className="text-muted-foreground max-w-2xl">
              The embedding model converts text into vector representations for semantic search.
              Your choice affects search quality and performance.
            </p>

            {currentEmeddingModel ? (
              <div className="mt-2">
                {/* @ts-ignore - Ignoring type issues with the ModelPreview component */}
                <ModelPreview model={currentEmeddingModel} display />
              </div>
            ) : (
              <div className="relative w-full rounded-lg border p-4" role="alert">
                <h5 className="mb-1 font-medium leading-none tracking-tight">No embedding model selected</h5>
                <div className="text-sm">
                  Choose an embedding model to enable semantic search functionality.
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight !text-2xl">Search Post-processing</h2>
            <p className="text-muted-foreground max-w-2xl">
              These settings control how search results are processed after initial retrieval
              to improve relevance and quality of results.
            </p>

            <CardSection className="!w-full max-w-2xl">
              {searchSettings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchSettingDetail 
                    label="Reranking Model" 
                    value={searchSettings.rerank_model_name || "Not set"} 
                    tooltip="Reranking models improve search quality by reordering results based on semantic relevance."
                  />
                  
                  <SearchSettingDetail 
                    label="Results to Rerank" 
                    value={searchSettings.num_rerank}
                    tooltip="Number of initial search results that will be processed by the reranking model."
                  />
                  
                  <SearchSettingDetail 
                    label="Multilingual Expansion" 
                    value={searchSettings.multilingual_expansion.length > 0
                      ? searchSettings.multilingual_expansion.join(", ")
                      : "None"}
                    tooltip="Enables searching across multiple languages by automatically translating queries."
                  />
                  
                  <SearchSettingDetail 
                    label="Multipass Indexing" 
                    value={searchSettings.multipass_indexing}
                    tooltip="Analyzes documents from multiple perspectives to improve retrieval quality."
                  />
                  
                  <SearchSettingDetail 
                    label="Disable Reranking for Streaming" 
                    value={searchSettings.disable_rerank_for_streaming}
                    tooltip="When enabled, skips reranking for streaming responses to improve response speed."
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No search settings available</p>
                </div>
              )}
            </CardSection>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Link href="/admin/embeddings">
              <button 
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 ${settings?.settings.needs_reindexing ? 'subtle-pulse' : ''}`}
              >
                <span>Update Search Settings</span>
              </button>
            </Link>
            
            {currentEmeddingModel && (
              <Link href="/admin/indexing/status">
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground border h-10 px-4 py-2 gap-2"
                >
                  <span>View Indexing Status</span>
                </button>
              </Link>
            )}
          </div>
        </>
      ) : (
        <RenderUpgradingPage />
      )}
    </div>
  );
}

function Page() {
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title="Search Settings"
        icon={<EmbeddingIcon size={32} className="my-auto" />}
        description="Configure embedding models and search behavior for optimal retrieval performance."
      />
      <Main />
    </div>
  );
}

export default Page;