"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { SubscriptionSummary } from "@/components/admin/billing/SubscriptionSummary";
import { BillingAlerts } from "@/components/admin/billing/BillingAlerts";
import { fetchCustomerPortal, useBillingInformation } from "@/lib/billing/utils";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { SeatManagement } from "@/components/admin/billing/SeatManagement";
import { updateSubscriptionQuantity } from "@/lib/billing/utils";

export default function BillingPage() {
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    data: billingInformation,
    error,
    isLoading,
    refreshBillingInformation,
  } = useBillingInformation();

  useEffect(() => {
    // Check for success redirects from payment provider
    const url = new URL(window.location.href);
    if (url.searchParams.has("session_id")) {
      setPopupMessage({
        message: "Congratulations! Your subscription has been updated successfully.",
        type: "success",
      });
      // Remove query params to prevent showing the message again on refresh
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleManageSubscription = async () => {
    try {
      const response = await fetchCustomerPortal();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create customer portal session: ${
            errorData.message || response.statusText
          }`
        );
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error("No portal URL returned from the server");
      }
      
      // Redirect to the customer portal
      window.location.href = url;
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      setPopupMessage({
        message: "Error accessing subscription management portal",
        type: "error",
      });
    }
  };

  const handleUpdateSeats = async (seats: number) => {
    try {
      const response = await updateSubscriptionQuantity(seats);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update seats: ${errorData.message || response.statusText}`
        );
      }
      
      // Refresh billing information after updating seats
      await refreshBillingInformation();
      
      setPopupMessage({
        message: "Subscription seats updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating seats:", error);
      setPopupMessage({
        message: `Error updating seats: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageTitle 
        title="Billing & Subscription" 
        icon={<CreditCard className="text-muted-foreground" size={24} />} 
      />
      
      {popupMessage && (
        <div className={`mb-4 rounded-md p-4 ${
          popupMessage.type === "success" 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {popupMessage.message}
          <button 
            className="float-right" 
            onClick={() => setPopupMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center">Loading subscription information...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          Error loading billing information. Please try again later.
        </div>
      ) : !billingInformation ? (
        <div className="py-8 text-center">No subscription information available.</div>
      ) : (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold">
                <CreditCard className="text-muted-foreground mr-4" size={24} />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SubscriptionSummary billingInformation={billingInformation} />
              <BillingAlerts billingInformation={billingInformation} />
              {billingInformation && (
                <SeatManagement 
                  billingInformation={billingInformation} onUpdateSeats={handleUpdateSeats}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Manage Subscription
              </CardTitle>
              <CardDescription>
                View your plan, update payment, or change subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageSubscription} className="w-full">
                <ArrowUpRight className="mr-2" size={16} />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}