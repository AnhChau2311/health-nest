import db from "@/lib/db"
import{ endOfYear, format, getMonth, startOfYear } from "date-fns";
//import { daysOfweek } from "..";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "PENDING" | "COMPLETED" | "CANCELLED";

interface Appointment{
    status: AppointmentStatus;
    appointment_date: Date;
}

function isValidStatus(status: string):status is AppointmentStatus{
    return ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}

const initializedMonthlyData =()=>{
    const this_year = new Date().getFullYear();
    const months = Array.from(
        {length: getMonth(new Date())+1},
        (_, index)=>({
            name: format(new Date(this_year, index),"MMM"),
            appointment:0,
            completed:0,

        })
    );
    return months;
};

export const processAppointments = async(appointments:Appointment[]) => {
    const monthlyData = initializedMonthlyData();
    const appointmentCounts= appointments.reduce<
        Record<AppointmentStatus, number>
        >(
            (acc, appointment) => {
            const status = appointment.status
            const appointmentDate = appointment?.appointment_date;
            const monthIndex = getMonth(appointmentDate);
            if(
                appointmentDate >= startOfYear(new Date())&&
                appointmentDate <= endOfYear(new Date())
            ){
                monthlyData[monthIndex].appointment+=1;
                if(status ==="COMPLETED"){
                    monthlyData[monthIndex].completed+=1;
                }
            }
            if (isValidStatus(status)){
                acc[status] =(acc[status] || 0)+1;
            }
            return acc;
        },
        {
            PENDING:0,
            SCHEDULED:0,
            COMPLETED:0,
            CANCELLED:0,
        }
        );
        return { appointmentCounts, monthlyData};
    };

export async function getPatientDashboardStatistics(id:string){
    try {
        
        if (!id){
            return{
                success: false, 
                message: "No data found",
                data: null,
            };
        }

        const data = await db.patient.findUnique({
            where: {id},
            select: {
                id: true,
                first_name: true,
                last_name: true,
                gender: true,
                img: true,
            }
        });

        if(!data){
            return {success: false, message: "Patient data not found", status: 200, data: null}
        }

        const appointments = await db.appointment.findMany({
            where: {patient_id: data?.id},
            include: {
                doctor:{
                    select: {
                        id: true,
                        name: true,
                        img: true,
                        specialization: true,
                    },
                },
                patient:{
                    select:{
                        first_name: true,
                        last_name: true,
                        gender: true,
                        date_of_birth:true,
                        img: true,
                    },
                },
            },


            orderBy: {appointment_date: "desc"},
        });

        const {appointmentCounts, monthlyData} = await processAppointments(appointments)
        const last5Records = appointments.slice(0,5);

        //const today=daysOfweek[(new Date().getDay())]

        const availableDoctor = await db.doctor.findMany({
            select :{id:true,name:true, specialization:true,img:true, working_days:true},
            where:{
                working_days:{
                    some:{
                        day:{
                        //equals:today,
                        mode:"insensitive"
                    },
    
                },
            },
        },
            take:6,
        });
        console.log(availableDoctor);
        //TODO: process appointment info
        return {
            success: true, 
            data, 
            appointmentCounts, 
            last5Records: null,
            totalAppointments: appointments.length, 
            availableDoctor: null,
            monthlyData,
            status: 200,
        };
    } catch (error) {
        console.log(error);
        return {success: false, message: "Internal Server Error", status: 500}
    }
}

export async function getPatientById(id:string){
    try {
        const patient = await db.patient.findUnique({
            where: {id},
        })

        if(!patient){
            return{
                success: false,
                message: "Patient data not found",
                status: 200,
                data: null,
            }
        }

        return {success: true, data: patient, status: 200};
    } catch (error) {
        console.log(error);
        return {success: false, message: "Internal Server Error", status: 500}
    }
}
