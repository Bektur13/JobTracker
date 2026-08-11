"use client";

import React, { useState } from "react";
import { KanbanBoard, JobApplication, ApplicationStage } from "@/components/kanban/board";
import { ApplicationDetailDrawer } from "@/components/ApplicationDrawer";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kanban, BarChart3, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40">
        <h1 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          🎯 Job Tracker
        </h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Application
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-4">
        <Tabs defaultValue="board">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="board" className="gap-1.5 text-xs">
                <Kanban className="w-3.5 h-3.5" /> Pipeline Board
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 text-xs">
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="board" className="mt-0">
            <KanbanBoard
              initialApplications={MOCK_APPLICATIONS}
              onApplicationSelect={handleSelectApp}
              onStageChange={handleStageChange}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Slide-over Detail Drawer */}
      <ApplicationDetailDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}