"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, AlertCircle, Sparkles } from "lucide-react";

export type ApplicationStage = "APPLIED" | "SCREENING" | "TECHNICAL" | "OFFER" | "REJECTED";

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  stage: ApplicationStage;
  salaryRange?: string;
  matchScore?: number;
  updatedAt: string;
}

const STAGES: { id: ApplicationStage; label: string; color: string }[] = [
  { id: "APPLIED", label: "Applied", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "SCREENING", label: "Screening", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "TECHNICAL", label: "Technical", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "OFFER", label: "Offer", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "REJECTED", label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

interface BoardProps {
  initialApplications: JobApplication[];
  onApplicationSelect: (app: JobApplication) => void;
  onStageChange: (appId: string, newStage: ApplicationStage) => void;
}

export function KanbanBoard({ initialApplications, onApplicationSelect, onStageChange }: BoardProps) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = applications.find((a) => a.id === activeId);
    if (!activeItem) return;

    // Check if dropping over a column container or another item
    const isOverAColumn = STAGES.some((s) => s.id === overId);
    let targetStage: ApplicationStage | null = null;

    if (isOverAColumn) {
      targetStage = overId as ApplicationStage;
    } else {
      const overItem = applications.find((a) => a.id === overId);
      if (overItem) targetStage = overItem.stage;
    }

    if (targetStage && activeItem.stage !== targetStage) {
      setApplications((prev) =>
        prev.map((app) => (app.id === activeId ? { ...app, stage: targetStage! } : app))
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const activeItem = applications.find((a) => a.id === active.id);
    if (activeItem) {
      onStageChange(activeItem.id, activeItem.stage);
    }
    setActiveApp(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full overflow-x-auto p-2">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.stage === stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              applications={stageApps}
              onSelect={onApplicationSelect}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeApp ? <KanbanCard application={activeApp} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  applications,
  onSelect,
}: {
  stage: { id: ApplicationStage; label: string; color: string };
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div ref={setNodeRef} className="flex flex-col rounded-xl bg-slate-900/50 border border-slate-800 p-3 min-w-[260px] h-[calc(100vh-220px)]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-200">{stage.label}</span>
          <Badge variant="outline" className={stage.color}>
            {applications.length}
          </Badge>
        </div>
      </div>

      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {applications.map((app) => (
            <SortableCard key={app.id} application={app} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({ application, onSelect }: { application: JobApplication; onSelect: (app: JobApplication) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard application={application} onClick={() => onSelect(application)} />
    </div>
  );
}

function KanbanCard({ application, isDragging, onClick }: { application: JobApplication; isDragging?: boolean; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:border-slate-700 bg-slate-950 border-slate-800 transition-all shadow-sm ${
        isDragging ? "shadow-lg border-blue-500/50 scale-105" : ""
      }`}
    >
      <CardContent className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-100 text-sm leading-snug">{application.jobTitle}</h4>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{application.companyName}</span>
            </div>
          </div>
          {application.matchScore && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1 px-1.5 py-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              {application.matchScore}%
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
          {application.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{application.location}</span>
            </div>
          )}
          {application.salaryRange && (
            <span className="font-medium text-slate-400">{application.salaryRange}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}