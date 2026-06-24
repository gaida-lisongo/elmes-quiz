import { getAgents } from "@/app/actions/user.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AutorisationsPage from "./AutorisationsClient";

export const metadata: Metadata = {
  title: "Autorisations | ELMESQUIZ",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function Autorisations(){
    try {
        const req = await getAgents();
        
        if(!req?.success) throw new Error(req?.error);

        const agents = req?.data;

        return (
            <div>
                <PageBreadcrumb pageTitle="Agents" />
                <AutorisationsPage agents={agents} />
            </div>
        )
    } catch (error) {
        console.error('[AUTORISATIONS PAGE]', error);
    }
}