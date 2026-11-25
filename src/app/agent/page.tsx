import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AgentPortalClient from "@/components/agent/AgentPortalClient";

export const dynamic = "force-dynamic";

export default async function AgentPortalPage() {
  const user = await getSessionUser();

  if (!user || (user.role !== "MARKETING_AGENT" && user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  return (
    <AgentPortalClient
      initialUser={{
        id: user.id,
        name: user.name || "Field Agent",
        role: user.role,
        agentCode: user.agentCode || user.userIdTag || "STAFF",
      }}
    />
  );
}
