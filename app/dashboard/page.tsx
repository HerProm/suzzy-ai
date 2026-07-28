import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardForm } from "@/components/dashboard-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <main className="flex flex-1 flex-col">
        <DashboardForm />
      </main>
    </div>
  );
}
