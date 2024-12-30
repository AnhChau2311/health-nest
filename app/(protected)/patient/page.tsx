import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/table/recent-appointment";
import { Button } from "@/components/ui/button";
import { getPatientDashboardStatistics } from "@/utils/services/patient";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const PatientDashboard = async () => {
  const user = await currentUser();

  const {
    data, 
    appointmentCounts,
    last5Records ,
    totalAppointments,
    availableDoctor,
    monthlyData,
  } = await getPatientDashboardStatistics(user?.id!);
  
  if (user && !data) {
    redirect("/patient/registration");
  }

  if(!data) return null;


  const cardData = [
    {
      title: "Appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/25 ",
      iconClassName: "bg-blue-600/25 text-blue-600",
      notes: "Total appointments",
    },
    {
      title: "Cancelled",
      value: appointmentCounts?.CANCELLED,
      icon: Briefcase,
      className: "bg-rose-600/25 ",
      iconClassName: "bg-rose-600/25 text-rose-600",
      notes: "Cancelled appointments",
    },
    {
      title: "Pending",
      value: appointmentCounts?.PENDING! + appointmentCounts?.SCHEDULED!,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15 ",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      notes: "Pending appointments",
    },
    {
      title: "Completed",
      value: appointmentCounts?.COMPLETED!,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15 ",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      notes: "Successful appointments",
    },
  ];
  
  return (
    <div className="py-6mpx-3 flex flex-col rounded-xl xl:flex-row gap-6">
      {/* {LEFT} */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg xl:text-2xl font-semibold">
              Welcome {data?.first_name || user?.firstName}
            </h1>

            <div className="space-x-2">
              <Button size={"sm"}>{new Date().getFullYear()}</Button>
              <Button size={"sm"} variant="outline" className="hover:underline">
                <Link href ="/patient/self">View Profile</Link>
              </Button>
            </div>
          </div>


          <div className="w-full flex flex-wrap gap-5">
            {cardData?.map((el, id) => (
              <StatCard note={""} key={id} {...el} link="#" />
            ))};
          </div>
        </div>

        <div className="h-[500px]">
          {<AppointmentChart data={monthlyData}/>}
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
        <RecentAppointments data={last5Records || []} />
        </div>
      </div>
      {/* {RIGHT} */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-[300px] mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>
        {/* <AvailableDoctors data={availableDoctor}/> */}
        {/* <PatientRatingsContainer/> */}
      </div>
    </div>
  );
};

export default PatientDashboard;