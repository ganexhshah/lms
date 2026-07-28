"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Briefcase, Building2, CalendarClock, Pencil, Plus } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { EmptyState } from "@/components/shared/empty-state";
import { EmployerPicker } from "@/components/shared/entity-pickers";
import { StudentPicker } from "@/components/students/student-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";
import type { PlacementRecord } from "@/types/ops";

const STATUS_TONE: Record<PlacementRecord["status"], "default" | "secondary" | "outline" | "destructive"> = {
  applied: "outline",
  interview: "secondary",
  offered: "secondary",
  placed: "default",
  rejected: "destructive",
};

type OpportunityForm = {
  studentId: string | null;
  employerId: string | null;
  role: string;
  interviewDate: string;
  cvName: string;
};

const EMPTY_OPPORTUNITY: OpportunityForm = {
  studentId: null,
  employerId: null,
  role: "",
  interviewDate: "",
  cvName: "",
};

type EmployerForm = {
  name: string;
  contact: string;
  email: string;
  city: string;
};

const EMPTY_EMPLOYER: EmployerForm = { name: "", contact: "", email: "", city: "" };

export default function PlacementPage() {
  const placement = useOpsStore((s) => s.placement);
  const updatePlacement = useOpsStore((s) => s.updatePlacement);
  const addPlacement = useOpsStore((s) => s.addPlacement);
  const employers = useOpsStore((s) => s.employers);
  const addEmployer = useOpsStore((s) => s.addEmployer);
  const updateEmployer = useOpsStore((s) => s.updateEmployer);
  const students = useStudentsStore((s) => s.students);

  const [query, setQuery] = useState("");

  const [oppOpen, setOppOpen] = useState(false);
  const [oppMode, setOppMode] = useState<"applied" | "interview">("applied");
  const [oppForm, setOppForm] = useState<OpportunityForm>(EMPTY_OPPORTUNITY);

  const [employerOpen, setEmployerOpen] = useState(false);
  const [editingEmployerId, setEditingEmployerId] = useState<string | null>(null);
  const [employerForm, setEmployerForm] = useState<EmployerForm>(EMPTY_EMPLOYER);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return placement;
    return placement.filter((p) =>
      `${p.student} ${p.employer} ${p.role}`.toLowerCase().includes(q)
    );
  }, [placement, query]);

  const interviewQueue = useMemo(
    () => placement.filter((p) => p.status === "interview" || p.status === "applied"),
    [placement]
  );

  function openOpportunity(mode: "applied" | "interview") {
    setOppMode(mode);
    setOppForm(EMPTY_OPPORTUNITY);
    setOppOpen(true);
  }

  function submitOpportunity() {
    const student = students.find((s) => s.id === oppForm.studentId);
    const employer = employers.find((e) => e.id === oppForm.employerId);
    if (!student) {
      toast.error("Select a student");
      return;
    }
    if (!employer) {
      toast.error("Select an employer");
      return;
    }
    if (!oppForm.role.trim()) {
      toast.error("Role is required");
      return;
    }
    addPlacement({
      student: studentFullName(student),
      studentId: student.id,
      employer: employer.name,
      employerId: employer.id,
      role: oppForm.role.trim(),
      interviewDate: oppForm.interviewDate,
      status: oppMode,
      cvName: oppForm.cvName.trim() || null,
    });
    toast.success(oppMode === "interview" ? "Interview scheduled" : "Opportunity added");
    setOppOpen(false);
  }

  function openAddEmployer() {
    setEditingEmployerId(null);
    setEmployerForm(EMPTY_EMPLOYER);
    setEmployerOpen(true);
  }

  function openEditEmployer(id: string) {
    const employer = employers.find((e) => e.id === id);
    if (!employer) return;
    setEditingEmployerId(id);
    setEmployerForm({
      name: employer.name,
      contact: employer.contact,
      email: employer.email,
      city: employer.city,
    });
    setEmployerOpen(true);
  }

  function submitEmployer() {
    if (!employerForm.name.trim()) {
      toast.error("Employer name is required");
      return;
    }
    if (editingEmployerId) {
      updateEmployer(editingEmployerId, employerForm);
      toast.success("Employer updated");
    } else {
      addEmployer(employerForm);
      toast.success("Employer added");
    }
    setEmployerOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Placement" description="Employers, student CVs, interviews, and job tracking." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Opportunities" value={String(placement.length)} />
        <Stat label="Employers" value={String(employers.length)} />
        <Stat label="Placed" value={String(placement.filter((p) => p.status === "placed").length)} />
      </div>
      <Card className="shadow-none">
        <Tabs defaultValue="tracking">
          <CardHeader className="space-y-3 border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Placement board</CardTitle>
              <TabsList variant="line">
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="employers">Employers</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="tracking" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
                <Button size="sm" onClick={() => openOpportunity("applied")}>
                  <Plus /> New opportunity
                </Button>
              </div>
              {filtered.length === 0 ? (
                <EmptyState icon={Briefcase} title="No placements" description="Add a new opportunity to get started." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Employer</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.student}</TableCell>
                        <TableCell>{p.employer}</TableCell>
                        <TableCell>{p.role}</TableCell>
                        <TableCell>
                          <SoftBadge tone={STATUS_TONE[p.status]}>{p.status}</SoftBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={p.status}
                            onValueChange={(v) => {
                              if (!v) return;
                              updatePlacement(p.id, { status: v as PlacementRecord["status"] });
                              toast.success("Status updated");
                            }}
                          >
                            <SelectTrigger className="ml-auto w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(["applied", "interview", "offered", "placed", "rejected"] as const).map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="employers" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={openAddEmployer}>
                  <Plus /> Add employer
                </Button>
              </div>
              {employers.length === 0 ? (
                <EmptyState icon={Building2} title="No employers" description="Add an employer to get started." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {employers.map((e) => (
                    <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.contact} · {e.email}</p>
                        <p className="text-xs text-muted-foreground">{e.city}</p>
                      </div>
                      <Button variant="ghost" size="icon-xs" onClick={() => openEditEmployer(e.id)}>
                        <Pencil />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="interviews" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => openOpportunity("interview")}>
                  <Plus /> New interview
                </Button>
              </div>
              {interviewQueue.length === 0 ? (
                <EmptyState icon={CalendarClock} title="No interviews" description="No applied or interview-stage candidates." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Employer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Interview</TableHead>
                      <TableHead>CV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviewQueue.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.student}</TableCell>
                        <TableCell>{p.employer}</TableCell>
                        <TableCell>
                          <SoftBadge tone={STATUS_TONE[p.status]}>{p.status}</SoftBadge>
                        </TableCell>
                        <TableCell>{p.interviewDate || "—"}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={p.cvName ?? ""}
                            placeholder="CV file name"
                            className="h-7 w-40 text-xs"
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (value === (p.cvName ?? "")) return;
                              updatePlacement(p.id, { cvName: value || null });
                              toast.success("CV updated");
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={oppOpen} onOpenChange={setOppOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{oppMode === "interview" ? "New interview" : "New opportunity"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Student</Label>
              <StudentPicker value={oppForm.studentId} onChange={(id) => setOppForm({ ...oppForm, studentId: id })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Employer</Label>
              <EmployerPicker value={oppForm.employerId} onChange={(id) => setOppForm({ ...oppForm, employerId: id })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Input value={oppForm.role} onChange={(e) => setOppForm({ ...oppForm, role: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Interview date</Label>
              <Input
                type="date"
                value={oppForm.interviewDate}
                onChange={(e) => setOppForm({ ...oppForm, interviewDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CV file name (optional)</Label>
              <Input value={oppForm.cvName} onChange={(e) => setOppForm({ ...oppForm, cvName: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOppOpen(false)}>Cancel</Button>
            <Button onClick={submitOpportunity}>{oppMode === "interview" ? "Schedule" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={employerOpen} onOpenChange={setEmployerOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingEmployerId ? "Edit employer" : "Add employer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={employerForm.name} onChange={(e) => setEmployerForm({ ...employerForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact person</Label>
              <Input value={employerForm.contact} onChange={(e) => setEmployerForm({ ...employerForm, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={employerForm.email} onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={employerForm.city} onChange={(e) => setEmployerForm({ ...employerForm, city: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployerOpen(false)}>Cancel</Button>
            <Button onClick={submitEmployer}>{editingEmployerId ? "Save changes" : "Add employer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
