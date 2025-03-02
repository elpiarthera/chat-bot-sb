import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InfoItem } from "./InfoItem"
import { BillingInformation } from "@/lib/types/billing"
import { Plus, Minus, Save } from "lucide-react"

interface SeatManagementProps {
  billingInformation: BillingInformation
  onUpdateSeats: (seats: number) => Promise<void>
}

export function SeatManagement({
  billingInformation,
  onUpdateSeats
}: SeatManagementProps) {
  const [seats, setSeats] = useState(billingInformation.seats)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateSeats = async () => {
    if (seats === billingInformation.seats) return

    setIsUpdating(true)
    try {
      await onUpdateSeats(seats)
      // Success is handled by parent component
    } catch (error) {
      console.error("Failed to update seats:", error)
      // Reset to original value on error
      setSeats(billingInformation.seats)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Seat Management</CardTitle>
        <CardDescription>
          Add or remove seats for your team members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <InfoItem
            title="Current Seats"
            value={billingInformation.seats.toString()}
            className="flex-1"
          />
          <div className="bg-muted flex-1 rounded-lg p-4">
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              Update Seats
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1 || isUpdating}
              >
                <Minus className="size-4" />
              </Button>

              <Input
                type="number"
                min="1"
                value={seats}
                onChange={e => setSeats(parseInt(e.target.value) || 1)}
                className="text-center"
                disabled={isUpdating}
              />

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeats(seats + 1)}
                disabled={isUpdating}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleUpdateSeats}
          disabled={seats === billingInformation.seats || isUpdating}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Seats"}
          {!isUpdating && <Save className="ml-2 size-4" />}
        </Button>
        <p className="text-muted-foreground mt-2 text-sm">
          Your billing amount will be prorated based on the number of seats and
          your billing cycle.
        </p>
      </CardContent>
    </Card>
  )
}
