import React, { useEffect, useState } from "react";
import { Edit, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ===== Reusable Searchable Select Component =====
function SearchableSelect({ items, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? items.find((item) => item.contact_number === value)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList className="max-h-40 overflow-y-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.contact_number}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.contact_number);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.contact_number ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name} ({item.contact_number})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function DutyAssignmentPage() {
  const API_BASE_URL = "http://localhost:8000/dutyassignment";
  const GUARDS_API = "http://localhost:8000/guard";
  const CLIENTS_API = "http://localhost:8000/client";
  const CACHE_KEY = "duty_assignments_cache";
  const CACHE_DURATION = 5 * 60 * 1000;

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
  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && !forceRefresh) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        setAssignments(data);
        setLoading(false);
        if (age < CACHE_DURATION && !searchTerm) return;
      }
      const url = searchTerm
        ? `${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`
        : API_BASE_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      setAssignments(data);
      if (!searchTerm) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuardsAndClients = async () => {
    try {
      const guardsRes = await fetch(GUARDS_API);
      const guardsData = await guardsRes.json();
      setGuards(guardsData);

      const clientsRes = await fetch(CLIENTS_API);
      const clientsData = await clientsRes.json();
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching guards/clients:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchGuardsAndClients();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // <--- start submitting
    try {
      const method = editAssignment ? "PUT" : "POST";
      const url = editAssignment
        ? `${API_BASE_URL}/${editAssignment.id}`
        : API_BASE_URL;

      const payload = {
        ...formData,
        start_date: formData.start_date
          ? `${formData.start_date}T00:00:00`
          : null,
        end_date: formData.end_date
          ? `${formData.end_date}T00:00:00`
          : null,
      };
      console.log("Submitting payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save assignment");
      setOpen(false);
      setEditAssignment(null);
      setFormData(defaultFormData);
      fetchAssignments(true);
    } catch (error) {
      console.error("Error saving assignment:", error);
    } finally {
      setSubmitting(false); // <--- stop submitting
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete assignment");
      fetchAssignments(true);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const statusColors = {
    ON_DUTY: "bg-green-500",
    OFF_DUTY: "bg-gray-500",
  };

  const getNameByContact = (list, contactNumber) => {
    const found = list.find((item) => item.contact_number === contactNumber);
    return found ? `${found.name} (${contactNumber})` : contactNumber;
  };

  return (
    <div className="p-6">
      {/* Search + Add */}
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Search by guard/client..."
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
              <TableHead>Guard</TableHead>
              <TableHead>Client</TableHead>
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
                <TableCell>
                  {getNameByContact(guards, assignment.guard_contact_number)}
                </TableCell>
                <TableCell>
                  {getNameByContact(clients, assignment.client_contact_number)}
                </TableCell>
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
                <TableCell className="capitalize">{assignment.shift_type}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[assignment.duty_status]} text-white`}>
                    {assignment.duty_status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex space-x-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => handleEdit(assignment)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(assignment.id)}>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editAssignment ? "Edit Assignment" : "New Assignment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Guard</Label>
              <SearchableSelect
                items={guards}
                value={formData.guard_contact_number}
                onChange={(val) => setFormData({ ...formData, guard_contact_number: val })}
                placeholder="Select guard"
              />
            </div>

            <div>
              <Label>Client</Label>
              <SearchableSelect
                items={clients}
                value={formData.client_contact_number}
                onChange={(val) => setFormData({ ...formData, client_contact_number: val })}
                placeholder="Select client"
              />
            </div>

            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
              value={formData.duty_status}
              onChange={(e) => setFormData({ ...formData, duty_status: e.target.value })}
            >
              <option value="on_duty">On Duty</option>
              <option value="off_duty">Off Duty</option>
              <option value="available">Available</option>
            </select>
            </div>
            <div>
              <Label>Shift Type</Label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? editAssignment
                  ? "Updating..."
                  : "Creating..."
                : editAssignment
                ? "Update Assignment"
                : "Create Assignment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
