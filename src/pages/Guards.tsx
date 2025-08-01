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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

// Mock data
const mockGuards = [
  {
    id: 1,
    name: 'John Doe',
    contact_number: '+1234567890',
    address: '123 Main St, City',
    current_salary: 25000,
    uniform_cost: 2500,
    monthly_deduction: 500,
    status: 'ACTIVE',
    join_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    contact_number: '+1234567891',
    address: '456 Oak Ave, Town',
    current_salary: 28000,
    uniform_cost: 2500,
    monthly_deduction: 300,
    status: 'ON_DUTY',
    join_date: '2024-02-01',
    created_at: '2024-02-01T09:00:00Z'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    contact_number: '+1234567892',
    address: '789 Pine St, Village',
    current_salary: 30000,
    uniform_cost: 2500,
    monthly_deduction: 200,
    status: 'OFF_DUTY',
    join_date: '2023-12-10',
    created_at: '2023-12-10T08:00:00Z'
  }
];

const statusColors = {
  ACTIVE: 'bg-success text-success-foreground',
  ON_DUTY: 'bg-primary text-primary-foreground',
  OFF_DUTY: 'bg-warning text-warning-foreground',
  INACTIVE: 'bg-destructive text-destructive-foreground'
};

export default function Guards() {
  const [guards, setGuards] = useState(mockGuards);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    address: '',
    current_salary: '',
    uniform_cost: '',
    monthly_deduction: '',
    status: 'ACTIVE'
  });

  const filteredGuards = guards.filter(guard =>
    guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guard.contact_number.includes(searchTerm)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGuard) {
      setGuards(guards.map(guard => 
        guard.id === editingGuard.id 
        ? { 
            ...guard, 
            ...formData, 
            id: editingGuard.id,
            current_salary: parseFloat(formData.current_salary) || 0,
            uniform_cost: parseFloat(formData.uniform_cost) || 0,
            monthly_deduction: parseFloat(formData.monthly_deduction) || 0
          }
          : guard
      ));
    } else {
      setGuards([...guards, {
        ...formData,
        id: Date.now(),
        current_salary: parseFloat(formData.current_salary) || 0,
        uniform_cost: parseFloat(formData.uniform_cost) || 0,
        monthly_deduction: parseFloat(formData.monthly_deduction) || 0,
        join_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_number: '',
      address: '',
      current_salary: '',
      uniform_cost: '',
      monthly_deduction: '',
      status: 'ACTIVE'
    });
    setEditingGuard(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (guard) => {
    setEditingGuard(guard);
    setFormData({
      name: guard.name,
      contact_number: guard.contact_number,
      address: guard.address,
      current_salary: guard.current_salary.toString(),
      uniform_cost: guard.uniform_cost.toString(),
      monthly_deduction: guard.monthly_deduction.toString(),
      status: guard.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (guardId) => {
    setGuards(guards.filter(guard => guard.id !== guardId));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guard Management</h1>
          <p className="text-muted-foreground">Manage security guard profiles and information</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add Guard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingGuard ? 'Edit Guard' : 'Add New Guard'}</DialogTitle>
              <DialogDescription>
                {editingGuard ? 'Update guard information' : 'Enter the details for the new security guard'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                    required
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary">Current Salary (Rs)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.current_salary}
                    onChange={(e) => setFormData({...formData, current_salary: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="uniform">Uniform Cost (Rs)</Label>
                  <Input
                    id="uniform"
                    type="number"
                    value={formData.uniform_cost}
                    onChange={(e) => setFormData({...formData, uniform_cost: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deduction">Monthly Deduction (Rs)</Label>
                  <Input
                    id="deduction"
                    type="number"
                    value={formData.monthly_deduction}
                    onChange={(e) => setFormData({...formData, monthly_deduction: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {editingGuard && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_DUTY">On Duty</SelectItem>
                      <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  {editingGuard ? 'Update Guard' : 'Add Guard'}
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
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Guards</p>
                <p className="text-2xl font-bold text-primary">{guards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center">
                {guards.filter(g => g.status === 'ACTIVE').length}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Active Guards</p>
                <p className="text-2xl font-bold text-success">{guards.filter(g => g.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {guards.filter(g => g.status === 'ON_DUTY').length}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-primary">{guards.filter(g => g.status === 'ON_DUTY').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Salary</p>
                <p className="text-2xl font-bold text-success">
                  Rs{Math.round(guards.reduce((sum, g) => sum + g.current_salary, 0) / guards.length).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Guards List</CardTitle>
          <CardDescription>View and manage all security guards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guards by name or contact..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuards.map((guard) => (
                  <TableRow key={guard.id}>
                    <TableCell className="font-medium">{guard.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {guard.contact_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-32" title={guard.address}>
                          {guard.address || 'Not provided'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Rs{guard.current_salary.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[guard.status]}>
                        {guard.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(guard.join_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(guard)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(guard.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}