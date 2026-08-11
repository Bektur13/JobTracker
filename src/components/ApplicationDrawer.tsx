"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Calendar, DollarSign, Mail, MapPin, User, Send, Plus } from "lucide-react";
import { JobApplication } from "@/components/kanban/board";

interface ApplicationDrawerProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailDrawer({ application, isOpen, onClose }: ApplicationDrawerProps) {
  const [notes, setNotes] = useState<Array<{ id: string; text: string; date: string }>>([
    { id: "1", text: "Recruiter mentioned phone screening takes 30 mins.", date: "2026-08-08" },
  ]);
  const [newNote, setNewNote] = useState("");

  if (!application) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      { id: Date.now().toString(), text: newNote, date: new Date().toISOString().split("T")[0] },
    ]);
    setNewNote("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-950 border-slate-800 text-slate-100 overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {application.stage}
            </Badge>
            <span className="text-xs text-slate-500">Updated {application.updatedAt}</span>
          </div>
          <SheetTitle className="text-xl text-slate-100">{application.jobTitle}</SheetTitle>
          <SheetDescription className="text-slate-400 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {application.companyName}
            </span>
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {application.location}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="notes">Notes & Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Salary Target
                </span>
                <p className="text-sm font-medium text-slate-200">
                  {application.salaryRange || "Not specified"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Applied On
                </span>
                <p className="text-sm font-medium text-slate-200">{application.updatedAt}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">Job Description</h4>
              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                <p>
                  We are looking for an experienced Software Engineer to help build scalable microservices and high-throughput web architectures using React, Next.js, Express, and PostgreSQL...
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-200">Interview Contacts</h4>
              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-800">
                <Plus className="w-3 h-3 mr-1" /> Add Contact
              </Button>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Sarah Jenkins</p>
                    <p className="text-xs text-slate-400">Technical Recruiter</p>
                  </div>
                </div>
                <a href="mailto:sarah@company.com" className="text-slate-400 hover:text-blue-400">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add meeting notes, questions, or updates..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="bg-slate-900 border-slate-800 text-sm text-slate-100"
              />
              <Button size="sm" onClick={handleAddNote} className="bg-blue-600 hover:bg-blue-500">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Note Log</span>
                    <span>{note.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">{note.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}