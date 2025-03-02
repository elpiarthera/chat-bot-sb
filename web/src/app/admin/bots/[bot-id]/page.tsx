"use client";

import { useRouter } from "next/navigation";
import { SlackBotUpdateForm } from "./SlackBotUpdateForm";
import { SlackChannelConfigsTable } from "./SlackChannelConfigsTable";
import { usePopup, PopupSpec, Popup } from "../../../../components/admin/connectors/Popup";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import { useEffect, useState, ReactNode } from "react";
import { SlackBot } from "../../../../lib/types";
import { LoadingAnimation } from "../../../../components/Loading";

// Custom component to render the popup
function PopupRenderer({ popup }: { popup: (PopupSpec & { onClose: () => void }) | null }) {
  if (!popup) return null;
  
  return (
    <Popup
      message={popup.message}
      type={popup.type}
      onClose={popup.onClose}
    />
  );
}

export default function SlackBotEditPage({ 
  params 
}: { 
  params: { "bot-id": string } 
}) {
  const router = useRouter();
  const { popup, setPopup } = usePopup();
  const [slackBot, setSlackBot] = useState<SlackBot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slackChannelConfigs, setSlackChannelConfigs] = useState([]);
  const [activeTab, setActiveTab] = useState("settings");

  const botId = params["bot-id"];

  useEffect(() => {
    async function fetchSlackBot() {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const response = await fetch(`/api/manage/admin/slack-app/bots/${botId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load bot: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSlackBot(data);
      } catch (error) {
        console.error("Error fetching Slack bot:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load Slack bot");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSlackBot();
  }, [botId]);

  const handleClose = () => {
    router.push("/admin/bots");
  };

  const refreshConfigs = async () => {
    try {
      const response = await fetch(`/api/manage/admin/slack-app/bots/${botId}/configs`);
      if (response.ok) {
        const data = await response.json();
        setSlackChannelConfigs(data);
      }
    } catch (error) {
      console.error("Error fetching configs:", error);
    }
  };

  useEffect(() => {
    if (botId) {
      refreshConfigs();
    }
  }, [botId]);

  // Create wrapper functions with the correct type signatures
  const handleSetPopupForUpdateForm = (spec: PopupSpec) => {
    setPopup(spec);
  };

  const handleSetPopupForConfigsTable = (spec: PopupSpec | null) => {
    if (spec) {
      setPopup(spec);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <LoadingAnimation text="Loading Slack bot" />
      </div>
    );
  }

  if (loadError || !slackBot) {
    return (
      <div className="container mx-auto py-8">
        <AdminPageHeader
          title="Error Loading Slack Bot"
          description={loadError || "Bot not found"}
          backUrl="/admin/bots"
          backLabel="Back to Bots"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PopupRenderer popup={popup} />
      <AdminPageHeader
        title={`Edit Slack Bot: ${slackBot.name}`}
        description="Manage your Slack bot settings and channel configurations."
        backUrl="/admin/bots"
        backLabel="Back to Bots"
      />

      <div className="mt-6 w-full">
        <div className="flex space-x-2 border-b">
          <button 
            className={`px-4 py-2 ${activeTab === "settings" ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab("settings")}
          >
            Bot Settings
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === "channels" ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab("channels")}
          >
            Channel Configurations
          </button>
        </div>
        
        {activeTab === "settings" && (
          <div className="bg-white mt-4 rounded-md border p-6">
            <SlackBotUpdateForm 
              slackBot={slackBot} 
              onClose={handleClose} 
              setPopup={handleSetPopupForUpdateForm} 
            />
          </div>
        )}
        
        {activeTab === "channels" && (
          <div className="mt-4">
            <SlackChannelConfigsTable 
              slackBotId={parseInt(botId)} 
              slackChannelConfigs={slackChannelConfigs} 
              refresh={refreshConfigs} 
              setPopup={handleSetPopupForConfigsTable}
            />
          </div>
        )}
      </div>
    </div>
  );
}