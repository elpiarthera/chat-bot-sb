"use client";

import { PageSelector } from "../../../components/PageSelector";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit, FiCopy, FiTrash, FiPower, FiSearch } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { SlackBot } from "../../../lib/types";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { cloneSlackBot, deleteSlackBot, updateSlackBotField } from "./new/lib";

const NUM_IN_PAGE = 20;

interface SlackBotWithConfig extends SlackBot {
  default_config?: {
    name: string;
  };
  configs_count?: number;
}

function ClickableTableRow({
  url,
  children,
  ...props
}: {
  url: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(url);
  }, [router, url]);

  const navigate = () => {
    router.push(url);
  };

  return (
    <TableRow {...props} onClick={navigate}>
      {children}
    </TableRow>
  );
}

// Function to toggle bot status
async function toggleBotStatus(botId: number, enabled: boolean, refreshCallback: () => void) {
  try {
    const response = await updateSlackBotField(botId, "enabled", enabled);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    refreshCallback(); // Refresh the bot list
  } catch (error) {
    console.error(`Failed to ${enabled ? 'enable' : 'disable'} bot`, error);
  }
}

export const SlackBotTable = ({ 
  slackBots,
  refreshCallback 
}: { 
  slackBots: SlackBotWithConfig[],
  refreshCallback?: () => void  
}) => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedBots, setSelectedBots] = useState<number[]>([]);
  const [botToDelete, setBotToDelete] = useState<SlackBotWithConfig | null>(null);
  const [botToClone, setBotToClone] = useState<SlackBotWithConfig | null>(null);
  const router = useRouter();

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle bot selection for bulk actions
  const handleBotSelection = (botId: number, checked: boolean) => {
    if (checked) {
      setSelectedBots([...selectedBots, botId]);
    } else {
      setSelectedBots(selectedBots.filter(id => id !== botId));
    }
  };

  // Handle select all bots
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBots(filteredBots.map(bot => bot.id));
    } else {
      setSelectedBots([]);
    }
  };

  // Handle bulk enable/disable
  const handleBulkToggle = async (enable: boolean) => {
    if (selectedBots.length === 0) return;
    
    try {
      // Perform operations sequentially to avoid race conditions
      for (const botId of selectedBots) {
        await updateSlackBotField(botId, "enabled", enable);
      }
      
      if (refreshCallback) refreshCallback();
      setSelectedBots([]);
    } catch (error) {
      console.error(`Failed to ${enable ? 'enable' : 'disable'} some bots`, error);
    }
  };

  // Filter bots based on search text and status filter
  const filteredBots = slackBots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "enabled" && bot.enabled) || 
      (statusFilter === "disabled" && !bot.enabled);
    
    return matchesSearch && matchesStatus;
  });

  // Sort the filtered bots
  const sortedBots = [...filteredBots].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = Number(a.enabled) - Number(b.enabled);
        break;
      case "channels":
        comparison = (a.configs_count || 0) - (b.configs_count || 0);
        break;
      default:
        comparison = a.id - b.id;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedBots.length / NUM_IN_PAGE);
  const botsForPage = sortedBots.slice(
    NUM_IN_PAGE * (page - 1),
    NUM_IN_PAGE * page
  );
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchText, statusFilter, sortField, sortDirection]);

  // Handle bot clone
  const handleCloneBot = async (bot: SlackBotWithConfig) => {
    try {
      const response = await cloneSlackBot(bot.id);
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      if (refreshCallback) refreshCallback();
    } catch (error) {
      console.error(`Failed to clone bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setBotToClone(null);
  };

  // Handle bot delete
  const handleDeleteBot = async (bot: SlackBotWithConfig) => {
    try {
      const response = await deleteSlackBot(bot.id);
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      if (refreshCallback) refreshCallback();
    } catch (error) {
      console.error(`Failed to delete bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setBotToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      {/* Search, filter, and controls header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search bots by name..."
            className="pl-10"
            value={searchText} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            className="border rounded-md px-3 py-2 w-full sm:w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/bots/new')}
          >
            Add New Bot
          </Button>
        </div>
      </div>
      
      {/* Bulk actions */}
      {selectedBots.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{selectedBots.length} selected</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleBulkToggle(true)}
          >
            Enable All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleBulkToggle(false)}
          >
            Disable All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setSelectedBots([])}
          >
            Clear Selection
          </Button>
        </div>
      )}
      
      {/* Table */}
      {slackBots.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedBots.length === filteredBots.length && filteredBots.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <button 
                    className="font-medium text-left w-full"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="font-medium text-left w-full"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead>Default Config</TableHead>
                <TableHead>
                  <button 
                    className="font-medium text-left w-full"
                    onClick={() => handleSort('channels')}
                  >
                    Channel Count {sortField === 'channels' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {botsForPage.map((bot) => (
                <ClickableTableRow key={bot.id} url={`/admin/bots/${bot.id}`}>
                  <TableCell>
                    <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedBots.includes(bot.id)}
                        onCheckedChange={(checked: boolean | "indeterminate") => handleBotSelection(bot.id, checked === true)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{bot.name}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bot.enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {bot.enabled ? "Enabled" : "Disabled"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {bot.default_config ? (
                      <span className="text-sm">{bot.default_config.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{bot.configs_count || 0}</TableCell>
                  <TableCell>
                    <div onClick={(e: React.MouseEvent) => e.stopPropagation()} className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/bots/${bot.id}/edit`)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBotToClone(bot)}
                      >
                        <FiCopy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBotToDelete(bot)}
                      >
                        <FiTrash className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBotStatus(bot.id, !bot.enabled, refreshCallback || (() => {}))}
                      >
                        <FiPower className={`h-4 w-4 ${bot.enabled ? 'text-green-500' : 'text-red-500'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </ClickableTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md">
          <p className="text-muted-foreground">Please add a New Slack Bot to begin chatting with Onyx!</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <PageSelector
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Confirmation Modals */}
      {botToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Bot</h2>
            <p className="mb-6">Are you sure you want to delete "{botToDelete.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBotToDelete(null)}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => handleDeleteBot(botToDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {botToClone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Clone Bot</h2>
            <p className="mb-6">Are you sure you want to clone "{botToClone.name}"? This will create a copy with the same settings.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBotToClone(null)}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => handleCloneBot(botToClone)}>
                Clone
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};