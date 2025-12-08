import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUpscaleHistory } from "@/lib/supabase/history";
import { HistoryTable } from "@/components/HistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const history = await getUpscaleHistory(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Upscale history</h1>
        <p className="text-sm text-muted-foreground">
          View all of your previously upscaled images, download them again, or compare resolutions.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent upscales</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTable items={history} />
        </CardContent>
      </Card>
    </div>
  );
}
