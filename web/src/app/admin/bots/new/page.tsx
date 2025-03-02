"use client";

import { useRouter } from "next/navigation";
import { SlackBotCreationForm } from "./SlackBotCreationForm";
import { usePopup, PopupProvider } from "../../../../contexts/PopupContext";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";

export default function NewSlackBotPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push("/admin/bots");
  };

  return (
    <PopupProvider>
      <NewSlackBotPageContent handleClose={handleClose} />
    </PopupProvider>
  );
}

function NewSlackBotPageContent({ handleClose }: { handleClose: () => void }) {
  const { popup, setPopup } = usePopup();
  
  return (
    <div className="container mx-auto py-8">
      {popup}
      <AdminPageHeader
        title="Create New Slack Bot"
        description="Configure a new Slack bot by providing the necessary tokens and settings."
        backUrl="/admin/bots"
        backLabel="Back to Bots"
      />
      <div className="bg-background mt-6 rounded-md border p-6">
        <SlackBotCreationForm 
          onClose={handleClose} 
          setPopup={setPopup} 
        />
      </div>
    </div>
  );
} 