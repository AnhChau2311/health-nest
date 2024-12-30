"use client";
import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import { appointmentAction } from "@/app/(protected)/actions/appointment";

interface ActionProps {
  id: string | number;
  status: string;
}

export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has been ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed. Try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Textarea
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        onClick={handleAction}
        disabled={isLoading || !selected}
      >
        {isLoading ? "Loading..." : "Submit"}
      </Button>

      <div className="flex items-center space-x-3 mt-4">
        <Button
          variant="outline"
          disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
          className="bg-yellow-200 text-black"
          onClick={() => setSelected("PENDING")}
        >
          Pending
        </Button>
        <Button
          variant="outline"
          disabled={status === "SCHEDULED" || isLoading || status === "COMPLETED"}
          className="bg-green-200 text-black"
          onClick={() => setSelected("SCHEDULED")}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          disabled={status === "COMPLETED" || isLoading}
          className="bg-emerald-200 text-black"
          onClick={() => setSelected("COMPLETED")}
        >
          Complete
        </Button>
        <Button
          variant="outline"
          disabled={status === "CANCELLED" || isLoading || status === "COMPLETED"}
          className="bg-red-200 text-black"
          onClick={() => setSelected("CANCELLED")}
        >
          Cancel
        </Button>
      </div>

      {selected === "CANCELLED" && (
        <Textarea
          disabled={isLoading}
          className="mt-4"
          placeholder="Reason for cancellation:"
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {selected && (
        <div className="flex items-center justify-between mt-6 bg-red-100 p-4 rounded">
          <p>Are you sure you want to perform this action?</p>
          <Button disabled={isLoading} type="button" onClick={handleAction}>
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};