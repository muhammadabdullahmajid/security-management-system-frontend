"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CACHE_KEY = "salary_cache";
const CACHE_TIME = 5 * 60 * 1000; // 5 min

// -----------------------------
// Types
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
};

type SalaryCreate = {
  guard_contact_number: string;
  month: number;
  year: number;
  deductions?: number | null;
  bonus?: number | null;
  notes?: string | null;
};

// -----------------------------
// API
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

async function fetchSalaries(): Promise<SalaryRecord[]> {
  return api<SalaryRecord[]>("/salaryrecord/");
}

async function createSalary(payload: SalaryCreate): Promise<SalaryRecord> {
  return api<SalaryRecord>("/salaryrecord/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function deleteSalary(id: number): Promise<void> {
  return api(`/salaryrecord/${id}`, { method: "DELETE" });
}

async function markAsPaid(contact_number: string): Promise<SalaryRecord> {
  return api<SalaryRecord>(`/salaryrecord/${contact_number}`, {
    method: "PUT",
    body: JSON.stringify({ is_paid: true, payment_date: new Date().toISOString() }),
  });
}

// Currency formatter for PKR
const formatPKR = (amount: number | null | undefined) =>
  (amount ?? 0).toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  });

// -----------------------------
// Component
// -----------------------------
export default function Salary() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [newSalary, setNewSalary] = useState<SalaryCreate>({
    guard_contact_number: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    deductions: 0,
    bonus: 0,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  async function loadData(forceUpdate = false) {
    const cached = localStorage.getItem(CACHE_KEY);
    const now = Date.now();

    if (!forceUpdate && cached) {
      try {
        const parsed = JSON.parse(cached);
        if (now - parsed.timestamp < CACHE_TIME) {
          setGuards(parsed.guards);
          setSalaries(parsed.salaries);
          return;
        }
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    const [g, s] = await Promise.all([fetchGuards(), fetchSalaries()]);
    setGuards(g);
    setSalaries(s);
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ guards: g, salaries: s, timestamp: now })
    );
  }

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(), CACHE_TIME);
    return () => clearInterval(interval);
  }, []);

  async function handleCreateSalary() {
    try {
      const created = await createSalary(newSalary);
      setSalaries([...salaries, created]);
      setOpenDialog(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    await deleteSalary(id);
    setSalaries((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleMarkPaid(contact_number: string) {
    try {
      const updated = await markAsPaid(contact_number);
      setSalaries((prev) =>
        prev.map((s) => (s.guard_contact_number === contact_number ? updated : s))
      );
    } catch (err: any) {
      alert("Failed to update salary status: " + err.message);
    }
  }

  const filteredSalaries = salaries.filter((s) => {
    const guard = guards.find((g) => g.contact_number === s.guard_contact_number);
    return (
      guard?.name?.toLowerCase().includes(search.toLowerCase()) ||
      guard?.contact_number.includes(search)
    );
  });

  const paidAmount = filteredSalaries
    .filter((s) => s.is_paid)
    .reduce((sum, s) => sum + s.final_salary, 0);

  const pendingAmount = filteredSalaries
    .filter((s) => !s.is_paid)
    .reduce((sum, s) => sum + s.final_salary, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Paid Salary Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {formatPKR(paidAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Salary Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {formatPKR(pendingAmount)}
          </CardContent>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Salary Records</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>Add Salary</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Salary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Guard</Label>
                  <Select
                    onValueChange={(val) =>
                      setNewSalary({ ...newSalary, guard_contact_number: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Guard" />
                    </SelectTrigger>
                    <SelectContent>
                      {guards.map((g) => (
                        <SelectItem key={g.contact_number} value={g.contact_number}>
                          {g.name} ({g.contact_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label>Month</Label>
                  <Input
                    type="number"
                    value={newSalary.month}
                    onChange={(e) =>
                      setNewSalary({ ...newSalary, month: +e.target.value })
                    }
                  />

                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={newSalary.year}
                    onChange={(e) =>
                      setNewSalary({ ...newSalary, year: +e.target.value })
                    }
                  />

                  <Label>Bonus</Label>
                  <Input
                    type="number"
                    value={newSalary.bonus || 0}
                    onChange={(e) =>
                      setNewSalary({ ...newSalary, bonus: +e.target.value })
                    }
                  />

                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    value={newSalary.deductions || 0}
                    onChange={(e) =>
                      setNewSalary({ ...newSalary, deductions: +e.target.value })
                    }
                  />

                  <Label>Notes</Label>
                  <Textarea
                    value={newSalary.notes || ""}
                    onChange={(e) =>
                      setNewSalary({ ...newSalary, notes: e.target.value })
                    }
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button onClick={handleCreateSalary}>Submit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guard</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalaries.map((s) => {
                const guard = guards.find(
                  (g) => g.contact_number === s.guard_contact_number
                );
                return (
                  <TableRow key={s.id}>
                    <TableCell>{guard?.name || s.guard_contact_number}</TableCell>
                    <TableCell>{guard?.contact_number}</TableCell>
                    <TableCell>{s.month}</TableCell>
                    <TableCell>{s.year}</TableCell>
                    <TableCell>{formatPKR(s.bonus)}</TableCell>
                    <TableCell>{formatPKR(s.deductions)}</TableCell>
                    <TableCell>{formatPKR(s.final_salary)}</TableCell>
                    <TableCell>{s.is_paid ? "Yes" : "No"}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {!s.is_paid && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(s.guard_contact_number)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
