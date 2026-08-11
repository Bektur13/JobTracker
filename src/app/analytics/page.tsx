import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 bg-background p-6 text-foreground">
      <div>
        <h1 className="text-lg font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">See how your search is trending.</p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
