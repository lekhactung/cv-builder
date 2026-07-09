import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const metedata = {
    title: "Dashboard | ResumeAI",
    description: "Quản lý CV của bạn",
};

export default async function DashboardLayout({children,} : {children : React.ReactNode}){
    const session = await auth();
    if (!session) redirect("/auth");
    return (
        <div className="dashboard-shell">
            <DashboardSidebar user = {session.user}/>
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    )
}

