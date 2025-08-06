import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';

const statusColors = {
  ACTIVE: 'bg-green-500 text-white',
  ON_DUTY: 'bg-blue-500 text-white',
  OFF_DUTY: 'bg-yellow-500 text-black',
  INACTIVE: 'bg-red-500 text-white'
};

const CACHE_KEY = "guardData";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function Guards() {
  const [guards, setGuards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    address: '',
    property: '',
    current_salary: '',
    uniform_cost: '',
    monthly_deduction: '',
  });

  const fetchGuards = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setUpdating(true);

      const url = searchTerm
        ? `http://localhost:8000/guard?search=${encodeURIComponent(searchTerm)}`
        : 'http://localhost:8000/guard/';

      const res = await axios.get(url);
      setGuards(res.data);

      // Save to localStorage cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          search: searchTerm,
          data: res.data,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = Date.now();

    if (cached && cached.search === searchTerm) {
      // Use cached data immediately
      setGuards(cached.data);

      if (now - cached.timestamp < CACHE_TIME) {
        return; // Cache still valid, skip fetch
      } else {
        fetchGuards(false); // Background refresh
        return;
      }
    }

    fetchGuards(); // No cache available
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      contact_number: formData.contact_number,
      address: formData.address || null,
      property: formData.property || null,
      current_salary: formData.current_salary ? parseFloat(formData.current_salary) : 0.0,
      uniform_cost: formData.uniform_cost || null,
      monthly_deduction: formData.monthly_deduction ? parseFloat(formData.monthly_deduction) : 0.0,
    };

    try {
      if (editingGuard) {
        await axios.put(`http://localhost:8000/guard/${editingGuard.id}`, payload);
      } else {
        await axios.post('http://localhost:8000/guard/', payload);
      }
      fetchGuards();
      resetForm();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/guard/${id}`);
      fetchGuards();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (guard) => {
    setEditingGuard(guard);
    setFormData({
      name: guard.name,
      contact_number: guard.contact_number,
      address: guard.address || '',
      property: guard.property || '',
      current_salary: guard.current_salary || '',
      uniform_cost: guard.uniform_cost || '',
      monthly_deduction: guard.monthly_deduction || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_number: '',
      address: '',
      property: '',
      current_salary: '',
      uniform_cost: '',
      monthly_deduction: '',
    });
    setEditingGuard(null);
    setIsDialogOpen(false);
  };

  return (
    <div>
      {/* Search & Add */}
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search guards by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
        <Button onClick={() => setIsDialogOpen(true)} className="ml-4">
          <Plus className="w-4 h-4 mr-2" /> Add Guard
        </Button>
      </div>

      {/* Table */}
      {loading && <p>Loading guards...</p>}
      {updating && <p>Updating data...</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guards.map((guard) => (
            <TableRow key={guard.id}>
              <TableCell>{guard.name}</TableCell>
              <TableCell>{guard.contact_number}</TableCell>
              <TableCell>{guard.address}</TableCell>
              <TableCell>{guard.property}</TableCell>
              <TableCell>
                <Badge className={statusColors[guard.status] || 'bg-gray-300'}>
                  {guard.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" onClick={() => handleEdit(guard)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(guard.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGuard ? 'Edit Guard' : 'Add Guard'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required />
            <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="Contact" required />
            <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" />
            <Input value={formData.property} onChange={(e) => setFormData({ ...formData, property: e.target.value })} placeholder="Property" />
            <Input type="number" value={formData.current_salary} onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })} placeholder="Salary" />
            <Input value={formData.uniform_cost} onChange={(e) => setFormData({ ...formData, uniform_cost: e.target.value })} placeholder="Uniform Cost" />
            <Input type="number" value={formData.monthly_deduction} onChange={(e) => setFormData({ ...formData, monthly_deduction: e.target.value })} placeholder="Monthly Deduction" />
            
            <div className="flex gap-2">
              <Button type="submit">{editingGuard ? 'Update' : 'Add'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
