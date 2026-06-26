import { getAgents } from "@/app/actions/user.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AutorisationsPage from "./AutorisationsClient";

export const metadata: Metadata = {
  title: "Autorisations",
  description:
    "ELMES-QUIZ — Gérez les autorisations des agents et modérateurs de la plateforme de quiz éducatifs.",
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