"use server"

import db from "@/lib/db"
import { AppointmentStatus } from "@prisma/client"

export async function appointmentAction(
    id: string |number,
    status: AppointmentStatus,
    reason: string
){
    try{
        await db.appointment.update({
            where: {id: Number(id)},
            data: {
                status,
                reason,
            },
        });
        return {
            success: true,
            error: false,
            msg: `Appointment has been ${status.toLowerCase()} successfully`,
        };

    }catch(error){
        console.log(error);
        return { 
            success: false,
            msg: "Internal Server Error",
            };
    }
}