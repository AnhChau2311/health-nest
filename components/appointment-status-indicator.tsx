import { cn } from "@/lib/utils";
import { Appointment, AppointmentStatus } from "@prisma/client";
import React from "react"

const status_color={
  PENDING: "bg-yellow-500/15 text-yellow-500",
  SCHEDULED: "bg-green-500/15 text-green-500",
  CANCELLED: "bg-red-500/15 text-red-500",
  COMPLETED: "bg-blue-500/15 text-blue-500",
};

export const AppointmentStatusIndicator = ({
  status,
}:{
  status:AppointmentStatus;
}) => {
  return(
<p
  className={cn(
    "w-fit px-2 py-1 rounded-full capitalize text-sm lg:text-sm",
    status_color[status]
  )}
>
  {status}
</p>
);
};