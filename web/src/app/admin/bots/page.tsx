"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@/contexts/PopupContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/ui/spinner";
import { AdminPageTitle } from "@/components/ui/admin-page-title";
import { SlackBotTable } from "./SlackBotTable";
import { SlackBot } from "@/lib/types";

interface SlackBotWithConfig extends SlackBot {
  default_config?: {
    name: string;
  };
  configs_count?: number;
}

export default function BotsPage() {
  const [slackBots, setSlackBots] = useState<SlackBotWithConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { popup, setPopup } = usePopup();

  // Function to fetch slack bots
  const fetchSlackBots = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/slack-bot");
      if (response.ok) {
        const data = await response.json();
        setSlackBots(data);
      } else {
        setPopup({
          message: "Failed to load Slack bots.",
          type: "error",
        });
      }
    } catch (error) {
      setPopup({
        message: "An error occurred while loading Slack bots.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlackBots();
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-4">
      {popup}
      <AdminPageTitle title="Slack Bot Management" />

      <div className="mt-6 rounded-lg border bg-white shadow-sm">
        <div className="p-6">
          <h2 className="mb-2 text-lg font-medium text-gray-900">
            Slack Bots
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Configure Slack bots to integrate Onyx with your Slack workspace.
            Each bot can be connected to multiple channels and document sets.{" "}
            <a 
              href="https://docs.example.com/slack-integration" 
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Documentation →
            </a>
          </p>
          
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => router.push("/admin/bots/new")}
            >
              <PlusIcon className="mr-2 size-4" />
              New Slack Bot
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <SlackBotTable 
              slackBots={slackBots} 
              refreshCallback={fetchSlackBots}
            />
          )}
        </div>
      </div>
    </div>
  );
} 