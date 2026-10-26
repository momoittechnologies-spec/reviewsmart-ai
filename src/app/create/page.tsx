import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function CreatePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/#customizer");
  }

  if (user.role === "BUSINESS_OWNER") {
    redirect("/dashboard");
  }

  if (user.role === "MARKETING_AGENT") {
    redirect("/agent");
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/#customizer");
}
