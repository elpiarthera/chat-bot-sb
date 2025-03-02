"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiPlusSquare, FiUsers } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { ThreeDotsLoader } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/Title";
import { usePopup, PopupSpec } from "@/components/admin/connectors/Popup";
import { errorHandlingFetcher } from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { ErrorCallout } from "@/components/ErrorCallout";
import BulkAdd from "@/components/admin/users/BulkAdd";
import Text from "@/components/ui/text";
import { InvitedUserSnapshot } from "@/lib/types";
import { NEXT_PUBLIC_CLOUD_ENABLED } from "@/lib/constants";

// Simplified version of the users page
const UsersTables = ({
  q,
  setPopup,
}: {
  q: string;
  setPopup: (spec: PopupSpec) => void;
}) => {
  const {
    data: invitedUsers,
    error: invitedUsersError,
    isLoading: invitedUsersLoading,
    mutate: invitedUsersMutate,
  } = useSWR<InvitedUserSnapshot[]>(
    "/api/manage/users/invited",
    errorHandlingFetcher
  );

  const { data: validDomains, error: domainsError } = useSWR<string[]>(
    "/api/manage/admin/valid-domains",
    errorHandlingFetcher
  );

  // Show loading animation only during the initial data fetch
  if (!validDomains) {
    return <ThreeDotsLoader />;
  }

  if (domainsError) {
    return (
      <>
        <ErrorCallout
          errorTitle="Error loading valid domains"
          errorMsg={domainsError?.info?.detail}
        />
      </>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Current Users</h2>
        <p>User management interface is loading...</p>
      </div>
      
      <div className="p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Invited Users</h2>
        <p>Invited users: {invitedUsers ? invitedUsers.length : 0}</p>
      </div>
    </div>
  );
};

const SearchableTables = () => {
  const { popup, setPopup } = usePopup();
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");

  return (
    <>
      <div>
        {typeof popup === "string" ? popup : null}
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-x-4">
            <AddUserButton setPopup={setPopup} />
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setQ(query)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <UsersTables q={q} setPopup={setPopup} />
        </div>
      </div>
    </>
  );
};

const AddUserButton = ({
  setPopup,
}: {
  setPopup: (spec: PopupSpec) => void;
}) => {
  const [modal, setModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: invitedUsers } = useSWR<InvitedUserSnapshot[]>(
    "/api/manage/users/invited",
    errorHandlingFetcher
  );

  const onSuccess = () => {
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/manage/users")
    );
    setModal(false);
    setPopup({
      message: "Users invited!",
      type: "success",
    });
  };

  const onFailure = async (res: Response) => {
    const error = (await res.json()).detail;
    setPopup({
      message: `Failed to invite users - ${error}`,
      type: "error",
    });
  };

  const handleInviteClick = () => {
    if (
      !NEXT_PUBLIC_CLOUD_ENABLED &&
      invitedUsers &&
      invitedUsers.length === 0
    ) {
      setShowConfirmation(true);
    } else {
      setModal(true);
    }
  };

  const handleConfirmFirstInvite = () => {
    setShowConfirmation(false);
    setModal(true);
  };

  return (
    <>
      <Button className="my-auto w-fit" onClick={handleInviteClick}>
        <div className="flex">
          <FiPlusSquare className="my-auto mr-2" />
          Invite Users
        </div>
      </Button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md max-w-md">
            <h3 className="text-lg font-semibold mb-2">First User Invitation</h3>
            <p className="mb-4">
              After inviting the first user, only invited users will be able to join this platform. 
              This is a security measure to control access to your instance.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmFirstInvite}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Bulk Add Users" onOutsideClick={() => setModal(false)}>
          <div className="flex flex-col gap-y-4">
            <Text className="font-medium text-base">
              Add the email addresses to import, separated by whitespaces.
              Invited users will be able to login to this domain with their
              email address.
            </Text>
            <BulkAdd onSuccess={onSuccess} onFailure={onFailure} />
          </div>
        </Modal>
      )}
    </>
  );
};

const Page = () => {
  return (
    <div className="mx-auto container">
      <AdminPageTitle title="Manage Users" icon={<FiUsers size={32} />} />
      <SearchableTables />
    </div>
  );
};

export default Page;