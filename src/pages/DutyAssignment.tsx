import React, { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function DutyAssignmentPage() {
  const API_BASE_URL = "http://localhost:8000/dutyassignment";
  const CACHE_KEY = "duty_assignments_cache";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

  const defaultFormData = {
    guard_contact_number: "",
    client_contact_number: "",
    company_name: "",
    start_date: "",
    end_date: "",
    duty_status: "ON_DUTY",
    shift_type: "day",
  };

  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && !forceRefresh) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Always show cached data instantly
        setAssignments(data);
        setLoading(false);

        if (age < CACHE_DURATION && !searchTerm) {
          // Cache is fresh → skip API call
          return;
        }
        // Cache is stale → refresh in background
      }

      const url = searchTerm
        ? `${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`
        : API_BASE_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch assignments");

      const data = await res.json();
      setAssignments(data);

      // Save to localStorage only when no search term
      if (!searchTerm) {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();

    // Auto-refresh every 5 minutes in background
    const interval = setInterval(() => fetchAssignments(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [searchTerm]);

  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setFormData({
      guard_contact_number: assignment.guard_contact_number,
      client_contact_number: assignment.client_contact_number,
      company_name: assignment.company_name || "",
      start_date: assignment.start_date?.split("T")[0] || "",
      end_date: assignment.end_date?.split("T")[0] || "",
      duty_status: assignment.duty_status || "ON_DUTY",
      shift_type: assignment.shift_type || "day",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete assignment");
      fetchAssignments(true); // force refresh
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editAssignment ? "PUT" : "POST";
      const url = editAssignment
        ? `${API_BASE_URL}/${editAssignment.id}`
        : API_BASE_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save assignment");

      setOpen(false);
      setEditAssignment(null);
      setFormData(defaultFormData);
      fetchAssignments(true); // force refresh after update
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  };

  const statusColors = {
    ON_DUTY: "bg-green-500",
    OFF_DUTY: "bg-gray-500",
  };

  return (
    <div className="p-6">
      {/* Search & Add */}
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Search by guard/client contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
        <Button
          onClick={() => {
            setEditAssignment(null);
            setFormData(defaultFormData);
            setOpen(true);
          }}
          className="ml-4"
        >
          <Plus className="h-4 w-4 mr-2" /> New Assignment
        </Button>
      </div>

      {/* Table */}
      {loading && assignments.length === 0 ? (
        <p>Loading assignments...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guard Contact</TableHead>
              <TableHead>Client Contact</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.guard_contact_number}</TableCell>
                <TableCell>{assignment.client_contact_number}</TableCell>
                <TableCell>{assignment.company_name || "-"}</TableCell>
                <TableCell>
                  {assignment.start_date
                    ? format(new Date(assignment.start_date), "yyyy-MM-dd")
                    : "-"}
                </TableCell>
                <TableCell>
                  {assignment.end_date
                    ? format(new Date(assignment.end_date), "yyyy-MM-dd")
                    : "Ongoing"}
                </TableCell>
                <TableCell className="capitalize">
                  {assignment.shift_type}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[assignment.duty_status]} text-white`}>
                    {assignment.duty_status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(assignment)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editAssignment ? "Edit Assignment" : "New Assignment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Guard Contact Number</Label>
              <Input
                required
                value={formData.guard_contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, guard_contact_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Client Contact Number</Label>
              <Input
                required
                value={formData.client_contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, client_contact_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={formData.duty_status}
                onChange={(e) =>
                  setFormData({ ...formData, duty_status: e.target.value })
                }
              >
                <option value="ON_DUTY">On Duty</option>
                <option value="OFF_DUTY">Off Duty</option>
              </select>
            </div>
            <div>
              <Label>Shift Type</Label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={formData.shift_type}
                onChange={(e) =>
                  setFormData({ ...formData, shift_type: e.target.value })
                }
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              {editAssignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
