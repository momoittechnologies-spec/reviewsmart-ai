import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function CreatePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/#customizer");
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin/merchants");
  }

  if (user.role === "BUSINESS_OWNER") {
    redirect("/dashboard");
  }

  redirect("/#customizer");
}
