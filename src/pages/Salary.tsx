// app/(wherever)/Salary.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Minus,
  FileText,
  Trash2,
  RefreshCw
} from "lucide-react";

// -----------------------------
// Types matching your FastAPI
// -----------------------------
type Guard = {
  id: number;
  name: string;
  contact_number: string;
  current_salary: number;
  uniform_cost?: number | null;
  uniform_deducted_amount?: number | null;
  monthly_deduction?: number | null;
};

type SalaryRecord = {
  id: number;
  guard_contact_number: string;
  month: number;
  year: number;
  deductions: number | null;
  bonus: number | null;
  is_paid: boolean;
  payment_date: string | null;
  notes: string | null;
  uniform_deduction: number | null;
  final_salary: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type SalaryStats = { paid_count: number; unpaid_count: number; total_paid: number; total_pending: number; };

type SalaryCreate = {
  guard_contact_number: string;
  month: number;
  year: number;
  deductions?: number | null;
  bonus?: number | null;
  notes?: string | null;
  is_paid: boolean;
  payment_date?: string | null;
};

type SalaryUpdate = Partial<SalaryCreate>;

// -----------------------------
// API client helpers
// Adjust API_BASE if your backend is mounted elsewhere
// -----------------------------
const API_BASE = "http://localhost:8000";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

async function fetchGuards(): Promise<Guard[]> {
  return api<Guard[]>("/guard");
}

type GetSalaryParams = {
  guard_contact_number?: string;
  month?: number;
  year?: number;
  is_paid?: boolean;
  skip?: number;
  limit?: number;
};
async function fetchSalaries(params: GetSalaryParams = {}): Promise<SalaryRecord[]> {
  const q = new URLSearchParams();
  if (params.guard_contact_number) q.set("guard_contact_number", params.guard_contact_number);
  if (params.month) q.set("month", String(params.month));
  if (params.year) q.set("year", String(params.year));
  if (typeof params.is_paid === "boolean") q.set("is_paid", String(params.is_paid));
  if (typeof params.skip === "number") q.set("skip", String(params.skip));
  if (typeof params.limit === "number") q.set("limit", String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return api<SalaryRecord[]>(`/salaryrecord/${suffix}`);
}

async function createSalary(payload: SalaryCreate): Promise<SalaryRecord> {
  return api<SalaryRecord>("/salaryrecord/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// WARNING: Your API updates by contact number, which is ambiguous if multiple records exist.
// Prefer adding PUT /salaryrecord/by-id/{id} on the backend and calling that instead.
async function updateSalaryByContact(contact_number: string, payload: SalaryUpdate): Promise<SalaryRecord> {
  return api<SalaryRecord>(`/salaryrecord/${encodeURIComponent(contact_number)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteSalaryById(id: number): Promise<void> {
  await api(`/salaryrecord/${id}`, { method: "DELETE" });
}

async function fetchStats(): Promise<SalaryStats> {
  return api<SalaryStats>("/salaryrecord/stat");
}

// -----------------------------
// UI Helpers
// -----------------------------
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function formatRs(n: number) {
  return `Rs${(n || 0).toLocaleString()}`;
}

// -----------------------------
// Component
// -----------------------------
export default function Salary() {
  // data
  const [guards, setGuards] = useState<Guard[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [stats, setStats] = useState<SalaryStats | null>(null);

  // ui state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"paid"|"unpaid">("all");

  // dialog & form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReturnType<typeof toUIRow> | null>(null);

  const [formData, setFormData] = useState({
    guard_contact_number: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    deductions: "",
    bonus: "",
    notes: "",
    is_paid: false,
    payment_date: ""
  });

  // -----------------------------
  // Load initial data
  // -----------------------------
  async function loadAll() {
    setError(null);
    setLoading(true);
    try {
      const [g, s, st] = await Promise.all([fetchGuards(), fetchSalaries(), fetchStats()]);
      setGuards(g);
      setSalaryRecords(s);
      setStats(st);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function refreshData() {
    setRefreshing(true);
    setError(null);
    try {
      const [s, st] = await Promise.all([fetchSalaries(), fetchStats()]);
      setSalaryRecords(s);
      setStats(st);
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  }

  // -----------------------------
  // Helpers to join guard data for table display
  // -----------------------------
  function guardByContact(contact: string) {
    return guards.find(g => g.contact_number === contact);
  }

  function toUIRow(r: SalaryRecord) {
    const g = guardByContact(r.guard_contact_number);
    return {
      id: r.id,
      guard_name: g?.name ?? r.guard_contact_number,
      guard_contact: r.guard_contact_number,
      month: r.month,
      year: r.year,
      base_salary: g?.current_salary ?? 0,
      deductions: r.deductions ?? 0,
      bonus: r.bonus ?? 0,
      final_salary: r.final_salary ?? 0,
      is_paid: r.is_paid,
      payment_date: r.payment_date,
      notes: r.notes ?? "",
      created_at: r.created_at ?? ""
    };
  }

  const uiRecords = useMemo(() => salaryRecords.map(toUIRow), [salaryRecords, guards]);

  const filteredRecords = useMemo(() => {
    return uiRecords.filter(record => {
      const matchesSearch =
        record.guard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.guard_contact.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && record.is_paid) ||
        (statusFilter === "unpaid" && !record.is_paid);
      return matchesSearch && matchesStatus;
    });
  }, [uiRecords, searchTerm, statusFilter]);

  // -----------------------------
  // Form & actions
  // -----------------------------
  const resetForm = () => {
    setFormData({
      guard_contact_number: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      deductions: "",
      bonus: "",
      notes: "",
      is_paid: false,
      payment_date: ""
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: ReturnType<typeof toUIRow>) => {
    setEditingRecord(record);
    setFormData({
      guard_contact_number: record.guard_contact,
      month: record.month,
      year: record.year,
      deductions: record.deductions?.toString() ?? "",
      bonus: record.bonus?.toString() ?? "",
      notes: record.notes ?? "",
      is_paid: record.is_paid,
      payment_date: record.payment_date ?? ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: SalaryCreate = {
        guard_contact_number: formData.guard_contact_number,
        month: Number(formData.month),
        year: Number(formData.year),
        deductions: formData.deductions === "" ? null : Number(formData.deductions),
        bonus: formData.bonus === "" ? null : Number(formData.bonus),
        notes: formData.notes || null,
        is_paid: !!formData.is_paid,
        payment_date: formData.is_paid
          ? (formData.payment_date || new Date().toISOString().slice(0, 10))
          : null
      };

      if (editingRecord) {
        // Uses your current endpoint: PUT /salaryrecord/{contact_number}
        // WARNING: This may update the first record for that contact_number (not specifically this month/year).
        await updateSalaryByContact(editingRecord.guard_contact, payload);
      } else {
        await createSalary(payload);
      }

      await refreshData();
      resetForm();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save record");
    }
  };

  const togglePaymentStatus = async (recordId: number) => {
    const rec = salaryRecords.find(r => r.id === recordId);
    if (!rec) return;

    try {
      const payload: SalaryUpdate = {
        is_paid: !rec.is_paid,
        payment_date: !rec.is_paid ? new Date().toISOString().slice(0,10) : null
      };
      await updateSalaryByContact(rec.guard_contact_number, payload);
      await refreshData();
    } catch (e: any) {
      setError(e?.message ?? "Failed to toggle payment status");
    }
  };

  const handleDelete = async (recordId: number) => {
    try {
      await deleteSalaryById(recordId);
      await refreshData();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete record");
    }
  };

  // Client-only preview of final salary (backend is source of truth due to uniform_deduction)
  const previewFinalSalary = useMemo(() => {
    const base = guardByContact(formData.guard_contact_number)?.current_salary ?? 0;
    const ded = parseFloat(formData.deductions) || 0;
    const bon = parseFloat(formData.bonus) || 0;
    // NOTE: backend may also subtract uniform_deduction; this is just an estimate.
    return base - ded + bon;
  }, [formData, guards]);

  const paidCount = stats?.paid_count ?? 0;
  const unpaidCount = stats?.unpaid_count ?? 0;
  const totalPaid = stats?.total_paid ?? 0;
  const totalPending = stats?.total_pending ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salary Management</h1>
          <p className="text-muted-foreground">Manage guard salaries, deductions, and bonus payments</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-medium">
                <Plus className="h-4 w-4 mr-2" />
                Add Salary Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingRecord ? "Edit Salary Record" : "Create Salary Record"}</DialogTitle>
                <DialogDescription>
                  {editingRecord ? "Update salary information and payment details" : "Create a new salary record for a guard"}
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-md p-2 mb-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="guard">Select Guard *</Label>
                    <Select
                      value={formData.guard_contact_number}
                      onValueChange={(value) => setFormData({ ...formData, guard_contact_number: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={guards.length ? "Choose a guard" : "Loading guards..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {guards.map((g) => (
                          <SelectItem key={g.contact_number} value={g.contact_number}>
                            {g.name} ({g.contact_number}) - {formatRs(g.current_salary || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Base Salary</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">
                        {formatRs(guardByContact(formData.guard_contact_number)?.current_salary ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">Month *</Label>
                    <Select
                      value={formData.month.toString()}
                      onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m, idx) => (
                          <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* adjust available years as needed */}
                        {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deductions">Deductions (Rs)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bonus">Bonus (Rs)</Label>
                    <Input
                      id="bonus"
                      type="number"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Final Salary (estimate)</Label>
                  <div className="mt-1 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <span className="text-lg font-semibold text-primary">
                      {formatRs(previewFinalSalary)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      The backend may apply uniform deduction; actual saved amount can differ.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1"
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_paid"
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: !!checked })}
                  />
                  <Label htmlFor="is_paid">Mark as paid</Label>
                </div>

                {formData.is_paid && (
                  <div>
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-gradient-primary">
                    {editingRecord ? "Update Record" : "Create Record"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading & error */}
      {loading && (
        <div className="text-sm text-muted-foreground">Loading data…</div>
      )}
      {!loading && error && (
        <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Paid Records</p>
                <p className="text-2xl font-bold text-success">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success">{formatRs(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-warning">{formatRs(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
          <CardDescription>Manage all salary records and payment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guard name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: "all"|"paid"|"unpaid") => setStatusFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Final Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.guard_name}</p>
                          <p className="text-sm text-muted-foreground">{record.guard_contact}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {months[record.month - 1]} {record.year}
                      </div>
                    </TableCell>
                    <TableCell>{formatRs(record.base_salary)}</TableCell>
                    <TableCell>
                      {record.deductions > 0 && (
                        <div className="flex items-center gap-1 text-destructive">
                          <Minus className="h-3 w-3" />
                          {formatRs(record.deductions)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.bonus > 0 && (
                        <div className="flex items-center gap-1 text-success">
                          <Plus className="h-3 w-3" />
                          {formatRs(record.bonus)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{formatRs(record.final_salary)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={record.is_paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {record.is_paid ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={record.is_paid ? "secondary" : "default"}
                          onClick={() => togglePaymentStatus(record.id)}
                        >
                          {record.is_paid ? "Mark Unpaid" : "Mark Paid"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No salary records found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
