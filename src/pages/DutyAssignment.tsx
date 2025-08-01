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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Edit,
  Calendar,
  Clock,
  User,
  Building2,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Mock data
const mockAssignments = [
  {
    id: 1,
    guard_name: 'John Doe',
    guard_contact: '+1234567890',
    client_name: 'Alpha Corporation',
    client_contact: '+1234567800',
    company_name: 'Alpha Corp Ltd.',
    start_date: '2024-03-01T08:00:00Z',
    end_date: null,
    duty_status: 'ON_DUTY',
    shift_type: 'day',
    is_active: true,
    duration_days: 30
  },
  {
    id: 2,
    guard_name: 'Sarah Smith',
    guard_contact: '+1234567891',
    client_name: 'Beta Solutions',
    client_contact: '+1234567801',
    company_name: 'Beta Solutions Inc.',
    start_date: '2024-02-15T20:00:00Z',
    end_date: null,
    duty_status: 'ON_DUTY',
    shift_type: 'night',
    is_active: true,
    duration_days: 45
  },
  {
    id: 3,
    guard_name: 'Mike Johnson',
    guard_contact: '+1234567892',
    client_name: 'Gamma Industries',
    client_contact: '+1234567802',
    company_name: 'Gamma Industries Pvt Ltd.',
    start_date: '2024-01-10T08:00:00Z',
    end_date: '2024-02-28T18:00:00Z',
    duty_status: 'COMPLETED',
    shift_type: 'day',
    is_active: false,
    duration_days: 49
  }
];

const mockGuards = [
  { name: 'John Doe', contact: '+1234567890' },
  { name: 'Sarah Smith', contact: '+1234567891' },
  { name: 'Mike Johnson', contact: '+1234567892' },
  { name: 'Emily Davis', contact: '+1234567893' }
];

const mockClients = [
  { name: 'Alpha Corporation', contact: '+1234567800', company: 'Alpha Corp Ltd.' },
  { name: 'Beta Solutions', contact: '+1234567801', company: 'Beta Solutions Inc.' },
  { name: 'Gamma Industries', contact: '+1234567802', company: 'Gamma Industries Pvt Ltd.' }
];

const statusColors = {
  ON_DUTY: 'bg-success text-success-foreground',
  OFF_DUTY: 'bg-warning text-warning-foreground',
  COMPLETED: 'bg-muted text-muted-foreground'
};

const statusIcons = {
  ON_DUTY: CheckCircle2,
  OFF_DUTY: AlertCircle,
  COMPLETED: XCircle
};

export default function DutyAssignment() {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [formData, setFormData] = useState({
    guard_contact: '',
    client_contact: '',
    company_name: '',
    start_date: '',
    end_date: '',
    duty_status: 'ON_DUTY',
    shift_type: 'day'
  });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.guard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.duty_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedGuard = mockGuards.find(g => g.contact === formData.guard_contact);
    const selectedClient = mockClients.find(c => c.contact === formData.client_contact);
    
    if (editingAssignment) {
      setAssignments(assignments.map(assignment => 
        assignment.id === editingAssignment.id 
          ? { 
              ...assignment, 
              ...formData,
              guard_name: selectedGuard?.name,
              client_name: selectedClient?.name,
              company_name: selectedClient?.company,
              is_active: formData.duty_status !== 'COMPLETED'
            }
          : assignment
      ));
    } else {
      setAssignments([...assignments, {
        ...formData,
        id: Date.now(),
        guard_name: selectedGuard?.name,
        client_name: selectedClient?.name,
        company_name: selectedClient?.company,
        is_active: formData.duty_status !== 'COMPLETED',
        duration_days: formData.end_date ? 
          Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      guard_contact: '',
      client_contact: '',
      company_name: '',
      start_date: '',
      end_date: '',
      duty_status: 'ON_DUTY',
      shift_type: 'day'
    });
    setEditingAssignment(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      guard_contact: assignment.guard_contact,
      client_contact: assignment.client_contact,
      company_name: assignment.company_name,
      start_date: assignment.start_date.split('T')[0],
      end_date: assignment.end_date ? assignment.end_date.split('T')[0] : '',
      duty_status: assignment.duty_status,
      shift_type: assignment.shift_type
    });
    setIsDialogOpen(true);
  };

  const onDutyCount = assignments.filter(a => a.duty_status === 'ON_DUTY').length;
  const offDutyCount = assignments.filter(a => a.duty_status === 'OFF_DUTY').length;
  const completedCount = assignments.filter(a => a.duty_status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duty Assignment</h1>
          <p className="text-muted-foreground">Assign guards to clients and manage duty schedules</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-medium">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
              <DialogDescription>
                {editingAssignment ? 'Update duty assignment details' : 'Assign a guard to a client for security duty'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guard">Select Guard *</Label>
                  <Select value={formData.guard_contact} onValueChange={(value) => setFormData({...formData, guard_contact: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a guard" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGuards.map((guard) => (
                        <SelectItem key={guard.contact} value={guard.contact}>
                          {guard.name} ({guard.contact})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="client">Select Client *</Label>
                  <Select value={formData.client_contact} onValueChange={(value) => {
                    const client = mockClients.find(c => c.contact === value);
                    setFormData({...formData, client_contact: value, company_name: client?.company || ''});
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.contact} value={client.contact}>
                          {client.name} ({client.company})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift_type">Shift Type</Label>
                  <Select value={formData.shift_type} onValueChange={(value) => setFormData({...formData, shift_type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duty_status">Duty Status</Label>
                  <Select value={formData.duty_status} onValueChange={(value) => setFormData({...formData, duty_status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_DUTY">On Duty</SelectItem>
                      <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
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
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-success">{onDutyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Off Duty</p>
                <p className="text-2xl font-bold text-warning">{offDutyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold text-primary">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Duty Assignments</CardTitle>
          <CardDescription>Manage all guard duty assignments and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All</TabsTrigger>
                <TabsTrigger value="active" onClick={() => setStatusFilter('ON_DUTY')}>Active</TabsTrigger>
                <TabsTrigger value="completed" onClick={() => setStatusFilter('COMPLETED')}>Completed</TabsTrigger>
              </TabsList>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guard</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => {
                      const StatusIcon = statusIcons[assignment.duty_status];
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{assignment.guard_name}</p>
                                <p className="text-sm text-muted-foreground">{assignment.guard_contact}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{assignment.client_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{assignment.company_name}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {assignment.shift_type === 'day' ? (
                                <Sun className="h-4 w-4 text-warning" />
                              ) : (
                                <Moon className="h-4 w-4 text-primary" />
                              )}
                              <span className="capitalize">{assignment.shift_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(assignment.start_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {assignment.end_date 
                                ? `${assignment.duration_days} days`
                                : 'Ongoing'
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[assignment.duty_status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {assignment.duty_status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}