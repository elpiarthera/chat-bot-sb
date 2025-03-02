"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../../../../components/ui/textarea";
import { inviteUsers } from "@/lib/users/actions";

interface BulkAddProps {
  onSuccess: () => void;
  onFailure: (res: Response) => Promise<void>;
}

export default function BulkAdd({ onSuccess, onFailure }: BulkAddProps) {
  const [emails, setEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Split by whitespace and filter out empty strings
      const emailList = emails
        .split(/[\s,]+/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emailList.length === 0) {
        setIsLoading(false);
        return;
      }

      const response = await inviteUsers(emailList);
      
      if (response.ok) {
        onSuccess();
        setEmails("");
      } else {
        await onFailure(response);
      }
    } catch (error) {
      console.error("Error inviting users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="user1@example.com user2@example.com user3@example.com"
          value={emails}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmails(e.target.value)}
          rows={5}
          className="w-full"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Inviting..." : "Invite Users"}
          </Button>
        </div>
      </form>
    </>
  );
} 