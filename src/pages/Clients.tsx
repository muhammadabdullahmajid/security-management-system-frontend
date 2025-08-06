import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  Users
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/client";
const CACHE_KEY = "clientData";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('clientSearchTerm') || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false); // For background update indicator

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_number: '',
    address: '',
    company_name: '',
    contract_rate: ''
  });

  // Save search term in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('clientSearchTerm', searchTerm);
  }, [searchTerm]);

  // Fetch clients from API
  const fetchClients = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setUpdating(true);
      }
      const res = await fetch(`${API_BASE_URL}?search=${searchTerm}`);
      const data = await res.json();
      setClients(data);

      // Cache new data
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          search: searchTerm,
          data,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  // Load from cache first, then update if stale
  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = Date.now();

    if (cached && cached.search === searchTerm) {
      setClients(cached.data);

      if (now - cached.timestamp < CACHE_TIME) {
        return; // Cache is fresh, no fetch
      } else {
        fetchClients(false); // Background update without blocking UI
        return;
      }
    }

    fetchClients(); // No cache, fetch normally
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await fetch(`${API_BASE_URL}/${editingClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            contract_rate: parseFloat(formData.contract_rate) || 0
          }),
        });
      } else {
        await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            contract_rate: parseFloat(formData.contract_rate) || 0
          }),
        });
      }
      resetForm();
      fetchClients();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      contact_number: '',
      address: '',
      company_name: '',
      contract_rate: ''
    });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      contact_person: client.contact_person,
      contact_number: client.contact_number,
      address: client.address,
      company_name: client.company_name,
      contract_rate: client.contract_rate.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await fetch(`${API_BASE_URL}/${clientId}`, { method: "DELETE" });
      fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const totalRevenue = clients.reduce((sum, client) => sum + (client.contract_rate || 0), 0);
  const totalGuards = clients.reduce((sum, client) => sum + (client.guards_assigned || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">Manage client information and contract details</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Update client information and contract details' : 'Enter the details for the new client'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div>
                <Label>Contract Rate (Rs/month)</Label>
                <Input
                  type="number"
                  value={formData.contract_rate}
                  onChange={(e) => setFormData({...formData, contract_rate: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-success" />
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-success">Rs{totalRevenue.toLocaleString()}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Guards Deployed</p>
            <p className="text-2xl font-bold text-primary">{totalGuards}</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-4 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-warning" />
          <div>
            <p className="text-sm text-muted-foreground">Avg. Contract</p>
            <p className="text-2xl font-bold text-warning">
              Rs{clients.length > 0 ? Math.round(totalRevenue / clients.length).toLocaleString() : '0'}
            </p>
          </div>
        </CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients List</CardTitle>
          <CardDescription>
            View and manage all client information{" "}
            {updating && <span className="text-xs text-muted-foreground">(Updating...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Contract Rate</TableHead>
                    <TableHead>Guards</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.company_name || 'Not specified'}</TableCell>
                      <TableCell>{client.contact_person || 'Not specified'}</TableCell>
                      <TableCell>{client.contact_number || 'Not provided'}</TableCell>
                      <TableCell>Rs{(client.contract_rate || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {client.guards_assigned || 0} assigned
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No clients found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
