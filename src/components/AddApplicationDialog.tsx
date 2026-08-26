"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { JobApplication } from "@/components/kanban/board";

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (application: JobApplication) => void;
}

const EMPTY_FORM = { jobTitle: "", companyName: "", location: "", salaryRange: "", description: ""};

export function AddApplicationDialog({ open, onOpenChange, onAdd }: AddApplicationDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.jobTitle.trim() || !form.companyName.trim()) return;

    onAdd({
      id: crypto.randomUUID(),
      jobTitle: form.jobTitle.trim(),
      companyName: form.companyName.trim(),
      location: form.location.trim() || undefined,
      salaryRange: form.salaryRange.trim() || undefined,
      stage: "APPLIED",
      updatedAt: new Date().toISOString().split("T")[0],
    });

    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Job Title
              <Input
                value={form.jobTitle}
                onChange={handleChange("jobTitle")}
                placeholder="Software Engineer"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Company
              <Input
                value={form.companyName}
                onChange={handleChange("companyName")}
                placeholder="Acme Corp"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Location
              <Input value={form.location} onChange={handleChange("location")} placeholder="Remote" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Salary Range
              <Input
                value={form.salaryRange}
                onChange={handleChange("salaryRange")}
                placeholder="$120k - $150k"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Description
              <Input
                value={form.description}
                onChange={handleChange("description")}
                placeholder="..."
              />
            </label>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
