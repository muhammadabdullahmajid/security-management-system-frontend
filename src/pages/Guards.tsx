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
  active: 'bg-green-500 text-white',
  on_leave: 'bg-yellow-500 text-black',
  inactive: 'bg-red-500 text-white',
};

const CACHE_KEY = "guardData";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function Guards() {
  const [guards, setGuards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [editingGuard, setEditingGuard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    address: '',
    cnic: '',
    current_salary: '',
    uniform_cost: '',
    monthly_deduction: '',
    status: 'active',
    image: null,
    cnic_front_image: null,
    cnic_back_image: null,
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
      setGuards(cached.data);

      if (now - cached.timestamp < CACHE_TIME) {
        return;
      } else {
        fetchGuards(false);
        return;
      }
    }

    fetchGuards();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('contact_number', formData.contact_number);
    payload.append('address', formData.address || '');
    payload.append('cnic', formData.cnic || '');
    payload.append('current_salary', formData.current_salary || '');
    payload.append('uniform_cost', formData.uniform_cost || '');
    payload.append('monthly_deduction', formData.monthly_deduction || '');
    payload.append('status', formData.status);

    if (formData.image) payload.append('image', formData.image);
    if (formData.cnic_front_image) payload.append('cnic_front_image', formData.cnic_front_image);
    if (formData.cnic_back_image) payload.append('cnic_back_image', formData.cnic_back_image);

    try {
      if (editingGuard) {
        await axios.put(`http://localhost:8000/guard/${editingGuard.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:8000/guard/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchGuards();
      resetForm();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err);
    } finally {
      setIsSubmitting(false);
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
      cnic: guard.cnic || '',
      current_salary: guard.current_salary || '',
      uniform_cost: guard.uniform_cost || '',
      monthly_deduction: guard.monthly_deduction || '',
      status: guard.status || 'active',
      image: null,
      cnic_front_image: null,
      cnic_back_image: null,
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (guard) => {
    setSelectedGuard(guard);
    setIsDetailOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_number: '',
      address: '',
      cnic: '',
      current_salary: '',
      uniform_cost: '',
      monthly_deduction: '',
      status: 'active',
      image: null,
      cnic_front_image: null,
      cnic_back_image: null,
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
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>CNIC</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guards.map((guard) => (
            <TableRow key={guard.id} className="cursor-pointer" onClick={() => handleViewDetails(guard)}>
              <TableCell>
                {guard.image_url ? (
                  <img
                    src={guard.image_url}
                    alt={guard.name}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell>{guard.name}</TableCell>
              <TableCell>{guard.contact_number}</TableCell>
              <TableCell>{guard.cnic}</TableCell>
              <TableCell>
                <Badge className={statusColors[guard.status] || 'bg-gray-300'}>
                  {guard.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuard ? 'Edit Guard' : 'Add Guard'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required />
            <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="Contact" required />
            <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" />
            <Input value={formData.cnic} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} placeholder="CNIC" required />
            <Input type="number" value={formData.current_salary} onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })} placeholder="Salary" />
            <Input value={formData.uniform_cost} onChange={(e) => setFormData({ ...formData, uniform_cost: e.target.value })} placeholder="Uniform Cost" />
            <Input type="number" value={formData.monthly_deduction} onChange={(e) => setFormData({ ...formData, monthly_deduction: e.target.value })} placeholder="Monthly Deduction" />
            
            {/* Status */}
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border rounded p-2 w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>

            {/* Image Uploads */}
            <label>Profile Image</label>
            <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />

            <label>CNIC Front</label>
            <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, cnic_front_image: e.target.files[0] })} />

            <label>CNIC Back</label>
            <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, cnic_back_image: e.target.files[0] })} />

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : editingGuard ? 'Update' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Guard Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedGuard && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedGuard.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img src={selectedGuard.image_url} alt={selectedGuard.name} className="w-32 h-32 rounded-full object-cover mx-auto" />
                <p><strong>Contact:</strong> {selectedGuard.contact_number}</p>
                <p><strong>Address:</strong> {selectedGuard.address}</p>
                <p><strong>CNIC:</strong> {selectedGuard.cnic}</p>
                <div className="flex gap-4">
                  {selectedGuard.cnic_front_url && (
                    <img src={selectedGuard.cnic_front_url} alt="CNIC Front" className="w-40 h-24 object-cover border" />
                  )}
                  {selectedGuard.cnic_back_url && (
                    <img src={selectedGuard.cnic_back_url} alt="CNIC Back" className="w-40 h-24 object-cover border" />
                  )}
                </div>
                <p><strong>Salary:</strong> {selectedGuard.current_salary}</p>
                <p><strong>Uniform Cost:</strong> {selectedGuard.uniform_cost}</p>
                <p><strong>Monthly Deduction:</strong> {selectedGuard.monthly_deduction}</p>
                <p><strong>Status:</strong> 
                  <Badge className={statusColors[selectedGuard.status] || 'bg-gray-300'}>
                    {selectedGuard.status}
                  </Badge>
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
