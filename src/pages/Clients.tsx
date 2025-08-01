import { useState } from 'react';
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
  Phone,
  MapPin,
  User,
  DollarSign,
  Users
} from 'lucide-react';

// Mock data
const mockClients = [
  {
    id: 1,
    name: 'Alpha Corporation',
    contact_person: 'John Smith',
    contact_number: '+1234567800',
    address: '123 Business Park, Corporate City',
    company_name: 'Alpha Corp Ltd.',
    contract_rate: 150000,
    guards_assigned: 5,
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: 2,
    name: 'Beta Solutions',
    contact_person: 'Sarah Johnson',
    contact_number: '+1234567801',
    address: '456 Tech Avenue, Innovation District',
    company_name: 'Beta Solutions Inc.',
    contract_rate: 200000,
    guards_assigned: 8,
    created_at: '2024-02-15T09:30:00Z'
  },
  {
    id: 3,
    name: 'Gamma Industries',
    contact_person: 'Mike Davis',
    contact_number: '+1234567802',
    address: '789 Industrial Zone, Manufacturing Hub',
    company_name: 'Gamma Industries Pvt Ltd.',
    contract_rate: 180000,
    guards_assigned: 6,
    created_at: '2024-01-25T14:15:00Z'
  }
];

export default function Clients() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_number: '',
    address: '',
    company_name: '',
    contract_rate: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id 
        ? { 
            ...client, 
            ...formData, 
            id: editingClient.id,
            contract_rate: parseFloat(formData.contract_rate) || 0
          }
          : client
      ));
    } else {
      setClients([...clients, {
        ...formData,
        id: Date.now(),
        guards_assigned: 0,
        created_at: new Date().toISOString(),
        contract_rate: parseFloat(formData.contract_rate) || 0
      }]);
    }
    resetForm();
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

  const handleDelete = (clientId) => {
    setClients(clients.filter(client => client.id !== clientId));
  };

  const totalRevenue = clients.reduce((sum, client) => sum + client.contract_rate, 0);
  const totalGuards = clients.reduce((sum, client) => sum + client.guards_assigned, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contract_rate">Contract Rate (Rs/month)</Label>
                <Input
                  id="contract_rate"
                  type="number"
                  value={formData.contract_rate}
                  onChange={(e) => setFormData({...formData, contract_rate: e.target.value})}
                  className="mt-1"
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-primary">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">Rs{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Guards Deployed</p>
                <p className="text-2xl font-bold text-primary">{totalGuards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Contract</p>
                <p className="text-2xl font-bold text-warning">
                  Rs{clients.length > 0 ? Math.round(totalRevenue / clients.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Clients List</CardTitle>
          <CardDescription>View and manage all client information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, company, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {client.company_name || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {client.contact_person || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {client.contact_number || 'Not provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="font-medium text-success">Rs{client.contract_rate.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {client.guards_assigned} assigned
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}