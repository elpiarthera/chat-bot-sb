"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/Title";
import { ToolIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  
  // Redirect to the main tools page where the user can create a new tool
  const handleCreateTool = () => {
    router.push("/admin/tools");
  };

  return (
    <div className="mx-auto container">
      <AdminPageTitle
        icon={<ToolIcon size={32} className="my-auto" />}
        title="Create Tool"
      />
      <div className="mt-4 p-6 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Create a New Tool</h2>
        <p className="mb-4">
          Tools allow you to extend your assistant's capabilities by connecting to external APIs and services.
        </p>
        <Button onClick={handleCreateTool}>
          Continue to Tool Creation
        </Button>
      </div>
    </div>
  );
} 