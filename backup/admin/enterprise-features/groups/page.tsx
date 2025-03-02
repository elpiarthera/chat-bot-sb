"use client";

import { useState } from "react";
import { useUserGroups, useUsers, useResources } from "@/lib/groups/hooks";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { GroupsTable } from "@/components/admin/groups/GroupsTable";
import { GroupCreationForm } from "@/components/admin/groups/GroupCreationForm";
import { GroupEditForm } from "@/components/admin/groups/GroupEditForm";
import { Button } from "@/components/ui/button";
import { UserGroup } from "@/lib/types/groups";
import { UserCircle, Loader2 } from "lucide-react";
import { usePopup } from "@/components/admin/connectors/Popup";

// Define the Group interface to match what GroupsTable expects
interface User {
  id: string;
  email: string;
  name?: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  users: User[];
  resources: Resource[];
}

// Custom hook for connectors (since it doesn't exist in the hooks file)
const useConnectors = () => {
  // This is a mock implementation since the actual hook doesn't exist
  return {
    data: [],
    isLoading: false,
    error: null
  };
};

// Main content component for better organization
const GroupsContent = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<UserGroup | null>(null);
  
  const { popup, setPopup } = usePopup();
  
  const { 
    data: groups, 
    isLoading: groupsLoading, 
    error: groupsError,
    refreshUserGroups 
  } = useUserGroups();
  
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useUsers();
  
  const { 
    data: resources, 
    isLoading: resourcesLoading, 
    error: resourcesError 
  } = useResources();

  const {
    data: connectors,
    isLoading: connectorsLoading,
    error: connectorsError
  } = useConnectors();
  
  const isLoading = groupsLoading || usersLoading || resourcesLoading || connectorsLoading;
  const hasError = groupsError || usersError || resourcesError || connectorsError;
  
  const handleCloseForm = () => {
    setIsCreating(false);
    setGroupToEdit(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="text-destructive py-8 text-center">
        <p>Error loading data. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Convert UserGroup[] to Group[] by adding description and converting ids
  const groupsWithDescription: Group[] = groups?.map(group => ({
    ...group,
    id: String(group.id), // Convert number id to string
    description: "", // Add empty description since it's required by Group interface
    // Convert resource ids from number to string
    resources: group.resources.map(resource => ({
      ...resource,
      id: String(resource.id)
    }))
  })) || [];
  
  return (
    <>
      {popup}
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          Create New Group
        </Button>
      </div>
      
      {groups && groups.length > 0 ? (
        <GroupsTable
          groups={groupsWithDescription}
          setPopup={setPopup}
          mutate={refreshUserGroups}
        />
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No User Groups Yet</h3>
          <p className="text-muted-foreground mb-6">
            User groups allow you to control access to resources for multiple users at once.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            Create Your First Group
          </Button>
        </div>
      )}
      
      {isCreating && users && resources && connectors && (
        <GroupCreationForm
          users={users} 
          resources={resources}
          connectors={connectors}
          setPopup={setPopup}
          onSuccess={() => {
            refreshUserGroups();
            handleCloseForm();
            setPopup({
              message: "Group created successfully",
              type: "success"
            });
          }}
        />
      )}
      
      {groupToEdit && users && resources && connectors && (
        <GroupEditForm
          groupId={String(groupToEdit.id)} // Convert number id to string
          allUsers={users} 
          allResources={resources}
          allConnectors={connectors}
          setPopup={setPopup}
          onSuccess={() => {
            refreshUserGroups();
            handleCloseForm();
            setPopup({
              message: "Group updated successfully",
              type: "success"
            });
          }}
        />
      )}
    </>
  );
};

// Main page component
export default function GroupsPage() {
  return (
    <div className="container max-w-6xl space-y-6">
      <AdminPageTitle
        title="User Groups"
        icon={<UserCircle className="size-8" />}
      />
      
      <GroupsContent />
    </div>
  );
}