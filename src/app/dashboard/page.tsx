"use client";

import { useState } from "react";
import { KanbanBoard, JobApplication, ApplicationStage } from "@/components/kanban/board";
import { ApplicationDetailDrawer } from "@/components/ApplicationDrawer";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_APPLICATIONS: JobApplication[] = [
  { id: "1", companyName: "Stripe", jobTitle: "Software Engineer", location: "Seattle, WA", stage: "APPLIED", salaryRange: "$150k - $180k", matchScore: 92, updatedAt: "2026-08-09" },
  { id: "2", companyName: "Vercel", jobTitle: "Fullstack Developer", location: "Remote", stage: "SCREENING", salaryRange: "$140k - $170k", matchScore: 88, updatedAt: "2026-08-07" },
  { id: "3", companyName: "Meta", jobTitle: "Frontend Engineer", location: "Bellevue, WA", stage: "TECHNICAL", salaryRange: "$165k - $195k", matchScore: 95, updatedAt: "2026-08-05" },
  { id: "4", companyName: "Airbnb", jobTitle: "Senior UI Engineer", location: "Remote", stage: "OFFER", salaryRange: "$180k - $210k", matchScore: 90, updatedAt: "2026-08-01" },
];

export default function DashboardPage() {
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectApp = (app: JobApplication) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    console.log(`Updated application ${appId} stage to ${newStage}`);
    // Here you execute your Express API patch request:
    // await fetch(`/api/applications/${appId}/stage`, { method: "PATCH", body: JSON.stringify({ stage: newStage }) })
  };

  return (
    <div className="flex flex-1 flex-col gap-4 bg-card p-6 text-card-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Pipeline Board</h1>
          <p className="text-sm text-muted-foreground">Track applications across every stage.</p>
        </div>
        <Button size="sm" className="gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Application
        </Button>
      </div>

      <KanbanBoard
        initialApplications={MOCK_APPLICATIONS}
        onApplicationSelect={handleSelectApp}
        onStageChange={handleStageChange}
      />

      <ApplicationDetailDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
