import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Building2, Users, User, Phone, Calendar, Clock, Sun, Moon,
  CheckCircle2, AlertCircle, FileText
} from 'lucide-react';

const statusColors = {
  ON_DUTY: 'bg-success text-success-foreground',
  OFF_DUTY: 'bg-warning text-warning-foreground'
};

const statusIcons = {
  ON_DUTY: CheckCircle2,
  OFF_DUTY: AlertCircle
};

export default function ClientGuard() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientData, setSelectedClientData] = useState(null);

  // Fetch all clients
  useEffect(() => {
    fetch('http://localhost:8000/client')
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error('Error fetching clients:', err));
  }, []);

  // Fetch guards for the selected client
  useEffect(() => {
    if (!selectedClientId) return;

    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);
    if (!selectedClient) return;

    fetch(`http://localhost:8000/dutyassignment/client-guard-assignment/${selectedClient.contact_number}`)
      .then(res => res.json())
      .then(data => setSelectedClientData(data[0])) // API returns an array
      .catch(err => console.error('Error fetching client guards:', err));
  }, [selectedClientId, clients]);

  const totalGuards = clients.reduce((sum, client) => sum + (client.total_guards || 0), 0);
  const totalOnDuty = selectedClientData ? selectedClientData.guards.filter(g => g.duty_status === 'ON_DUTY').length : 0;
  const totalOffDuty = selectedClientData ? selectedClientData.guards.filter(g => g.duty_status === 'OFF_DUTY').length : 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Client-Guard Assignment</h1>
        <p className="text-muted-foreground">View guards assigned to specific clients and their deployment details</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
  <Card>
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
</div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Select Client</CardTitle>
          <CardDescription>Choose a client to view their assigned guards</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name} ({client.company_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Client Overview */}
      {selectedClientData && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-lg font-semibold">{selectedClientData.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p>{selectedClientData.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact</label>
                <p>{selectedClientData.client_contact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Guards Assigned</label>
                <p className="text-2xl font-bold text-primary">{selectedClientData.total_guards}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Assigned Guards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedClientData.guards.map((guard) => {
                    const StatusIcon = statusIcons[guard.duty_status];
                    return (
                      <TableRow key={guard.guard_id}>
                        <TableCell>{guard.name}</TableCell>
                        <TableCell>{guard.contact_number}</TableCell>
                        <TableCell>
                          {guard.shift_type === 'day' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-primary" />}
                          {guard.shift_type} Shift
                        </TableCell>
                        <TableCell>{new Date(guard.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[guard.duty_status]}>
                            <StatusIcon className="h-3 w-3 mr-1" /> {guard.duty_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
