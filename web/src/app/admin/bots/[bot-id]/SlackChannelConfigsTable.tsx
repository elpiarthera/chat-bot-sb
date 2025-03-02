"use client";

import { PageSelector } from "../../../../components/PageSelector";
import { PopupSpec } from "../../../../components/admin/connectors/Popup";
import { EditIcon, TrashIcon } from "../../../../components/icons/icons";
import { SlackChannelConfig, deleteSlackChannelConfig, isPersonaASlackBotPersona } from "./lib";
import Link from "next/link";
import { useState } from "react";
import { FiPlusSquare, FiSettings } from "react-icons/fi";
import React from "react";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../../../../components/ui/tooltip";

const numToDisplay = 50;

export function SlackChannelConfigsTable({
  slackBotId,
  slackChannelConfigs,
  refresh,
  setPopup,
}: {
  slackBotId: number;
  slackChannelConfigs: SlackChannelConfig[];
  refresh: () => void;
  setPopup: (popupSpec: PopupSpec | null) => void;
}) {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const defaultConfig = slackChannelConfigs.find((config) => config.is_default);
  const channelConfigs = slackChannelConfigs.filter(
    (config) => !config.is_default
  );

  // Filter channel configs based on search text
  const filteredConfigs = channelConfigs.filter(config => 
    config.channel_config.channel_name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredConfigs.length / numToDisplay);
  const paginatedConfigs = filteredConfigs.slice(
    numToDisplay * (page - 1), 
    numToDisplay * page
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `/admin/bots/${slackBotId}/channels/${defaultConfig?.id}`;
                }}
              >
                <FiSettings className="mr-2" />
                Edit Default Configuration
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit the settings that apply to all channels by default</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/admin/bots/${slackBotId}/channels/new`}>
                <Button variant="outline">
                  <FiPlusSquare className="mr-2" />
                  New Channel Configuration
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a configuration for a specific channel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search channels..."
          className="w-full px-4 py-2 border rounded-md"
          value={searchText} 
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1); // Reset to first page when searching
          }}
        />
        {searchText && (
          <button
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSearchText("")}
          >
            ✕
          </button>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-medium mb-4">Channel-Specific Configurations</h2>
        <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Assistant</TableHead>
                <TableHead>Document Sets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedConfigs.map((slackChannelConfig) => {
                return (
                  <TableRow
                    key={slackChannelConfig.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => {
                      window.location.href = `/admin/bots/${slackBotId}/channels/${slackChannelConfig.id}`;
                    }}
                  >
                    <TableCell>
                      <div className="flex gap-x-2">
                        <div className="my-auto">
                          <EditIcon className="text-muted-foreground" />
                        </div>
                        <div className="my-auto">
                          {"#" + slackChannelConfig.channel_config.channel_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        {slackChannelConfig.persona &&
                        !isPersonaASlackBotPersona(
                          slackChannelConfig.persona
                        ) ? (
                          <Link
                            href={`/assistants/${slackChannelConfig.persona.id}`}
                            className="text-primary hover:underline"
                          >
                            {slackChannelConfig.persona.name}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {slackChannelConfig.persona &&
                        slackChannelConfig.persona.document_sets.length > 0
                          ? slackChannelConfig.persona.document_sets
                              .map((documentSet: { name: string }) => documentSet.name)
                              .join(", ")
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={slackChannelConfig.channel_config.disabled ? "outline" : "default"}>
                        {slackChannelConfig.channel_config.disabled ? "Disabled" : "Enabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:text-destructive"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  
                                  if (confirm("Are you sure you want to delete this channel configuration?")) {
                                    const response = await deleteSlackChannelConfig(
                                      slackChannelConfig.id
                                    );
                                    if (response.ok) {
                                      setPopup({
                                        message: `Channel configuration for #${slackChannelConfig.channel_config.channel_name} deleted`,
                                        type: "success",
                                      });
                                    } else {
                                      const errorMsg = await response.text();
                                      setPopup({
                                        message: `Failed to delete channel configuration - ${errorMsg}`,
                                        type: "error",
                                      });
                                    }
                                    refresh();
                                  }
                                }}
                              >
                                <TrashIcon />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete this channel configuration</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredConfigs.length === 0 && (
                <TableRow>
                  <TableCell>
                    <div className="text-center text-muted-foreground py-8">
                      {searchText ? 
                        "No channel configurations match your search. Clear the search or create a new configuration." :
                        "No channel-specific configurations. Add a new configuration to customize behavior for specific channels."
                      }
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredConfigs.length > numToDisplay && (
          <div className="mt-4 flex justify-center">
            <PageSelector
              totalPages={totalPages} 
              currentPage={page} 
              onPageChange={(newPage: number) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
}