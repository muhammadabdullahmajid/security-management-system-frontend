import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Users,
  User,
  Phone,
  Calendar,
  Clock,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

// Mock data
const mockClientGuardData = [
  {
    client_id: 1,
    client_name: 'Alpha Corporation',
    client_contact: '+1234567800',
    company_name: 'Alpha Corp Ltd.',
    total_guards: 5,
    guards: [
      {
        guard_id: 1,
        name: 'John Doe',
        contact_number: '+1234567890',
        duty_status: 'ON_DUTY',
        shift_type: 'day',
        start_date: '2024-01-15'
      },
      {
        guard_id: 2,
        name: 'Sarah Smith',
        contact_number: '+1234567891',
        duty_status: 'ON_DUTY',
        shift_type: 'night',
        start_date: '2024-02-01'
      },
      {
        guard_id: 3,
        name: 'Mike Johnson',
        contact_number: '+1234567892',
        duty_status: 'OFF_DUTY',
        shift_type: 'day',
        start_date: '2024-01-20'
      },
      {
        guard_id: 4,
        name: 'Emily Davis',
        contact_number: '+1234567893',
        duty_status: 'ON_DUTY',
        shift_type: 'day',
        start_date: '2024-02-10'
      },
      {
        guard_id: 5,
        name: 'Robert Wilson',
        contact_number: '+1234567894',
        duty_status: 'ON_DUTY',
        shift_type: 'night',
        start_date: '2024-02-15'
      }
    ]
  },
  {
    client_id: 2,
    client_name: 'Beta Solutions',
    client_contact: '+1234567801',
    company_name: 'Beta Solutions Inc.',
    total_guards: 3,
    guards: [
      {
        guard_id: 6,
        name: 'David Brown',
        contact_number: '+1234567895',
        duty_status: 'ON_DUTY',
        shift_type: 'day',
        start_date: '2024-01-25'
      },
      {
        guard_id: 7,
        name: 'Lisa Martinez',
        contact_number: '+1234567896',
        duty_status: 'ON_DUTY',
        shift_type: 'night',
        start_date: '2024-02-05'
      },
      {
        guard_id: 8,
        name: 'James Taylor',
        contact_number: '+1234567897',
        duty_status: 'OFF_DUTY',
        shift_type: 'day',
        start_date: '2024-02-12'
      }
    ]
  },
  {
    client_id: 3,
    client_name: 'Gamma Industries',
    client_contact: '+1234567802',
    company_name: 'Gamma Industries Pvt Ltd.',
    total_guards: 4,
    guards: [
      {
        guard_id: 9,
        name: 'Kevin Anderson',
        contact_number: '+1234567898',
        duty_status: 'ON_DUTY',
        shift_type: 'day',
        start_date: '2024-01-30'
      },
      {
        guard_id: 10,
        name: 'Michelle White',
        contact_number: '+1234567899',
        duty_status: 'ON_DUTY',
        shift_type: 'night',
        start_date: '2024-02-08'
      },
      {
        guard_id: 11,
        name: 'Thomas Garcia',
        contact_number: '+1234567900',
        duty_status: 'ON_DUTY',
        shift_type: 'day',
        start_date: '2024-02-18'
      },
      {
        guard_id: 12,
        name: 'Amanda Lee',
        contact_number: '+1234567901',
        duty_status: 'OFF_DUTY',
        shift_type: 'night',
        start_date: '2024-02-20'
      }
    ]
  }
];

const statusColors = {
  ON_DUTY: 'bg-success text-success-foreground',
  OFF_DUTY: 'bg-warning text-warning-foreground'
};

const statusIcons = {
  ON_DUTY: CheckCircle2,
  OFF_DUTY: AlertCircle
};

export default function ClientGuard() {
  const [selectedClientId, setSelectedClientId] = useState('');
  
  const selectedClientData = mockClientGuardData.find(
    client => client.client_id.toString() === selectedClientId
  );

  const totalGuards = mockClientGuardData.reduce((sum, client) => sum + client.total_guards, 0);
  const totalOnDuty = mockClientGuardData.reduce((sum, client) => 
    sum + client.guards.filter(guard => guard.duty_status === 'ON_DUTY').length, 0
  );
  const totalOffDuty = mockClientGuardData.reduce((sum, client) => 
    sum + client.guards.filter(guard => guard.duty_status === 'OFF_DUTY').length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Client-Guard Assignment</h1>
        <p className="text-muted-foreground">View guards assigned to specific clients and their deployment details</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-primary">{mockClientGuardData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Guards</p>
                <p className="text-2xl font-bold text-primary">{totalGuards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-success">{totalOnDuty}</p>
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
                <p className="text-2xl font-bold text-warning">{totalOffDuty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Selection */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Select Client
          </CardTitle>
          <CardDescription>Choose a client to view their assigned guards</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose a client to view assignments..." />
            </SelectTrigger>
            <SelectContent>
              {mockClientGuardData.map((client) => (
                <SelectItem key={client.client_id} value={client.client_id.toString()}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{client.client_name} ({client.company_name}) - {client.total_guards} guards</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Client Overview */}
      {selectedClientData && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-lg font-semibold text-foreground">{selectedClientData.client_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p className="text-foreground">{selectedClientData.company_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{selectedClientData.client_contact}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Guards Assigned</label>
                <p className="text-2xl font-bold text-primary">{selectedClientData.total_guards}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-muted-foreground">On Duty</p>
                  <p className="text-xl font-bold text-success">
                    {selectedClientData.guards.filter(g => g.duty_status === 'ON_DUTY').length}
                  </p>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm text-muted-foreground">Off Duty</p>
                  <p className="text-xl font-bold text-warning">
                    {selectedClientData.guards.filter(g => g.duty_status === 'OFF_DUTY').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Assigned Guards
              </CardTitle>
              <CardDescription>Guards currently assigned to {selectedClientData.client_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{guard.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {guard.contact_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {guard.shift_type === 'day' ? (
                                <Sun className="h-4 w-4 text-warning" />
                              ) : (
                                <Moon className="h-4 w-4 text-primary" />
                              )}
                              <span className="capitalize">{guard.shift_type} Shift</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(guard.start_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[guard.duty_status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {guard.duty_status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Clients Summary */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Clients Summary
          </CardTitle>
          <CardDescription>Overview of guard assignments across all clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Guards</TableHead>
                  <TableHead>On Duty</TableHead>
                  <TableHead>Off Duty</TableHead>
                  <TableHead>Deployment Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClientGuardData.map((client) => {
                  const onDutyCount = client.guards.filter(g => g.duty_status === 'ON_DUTY').length;
                  const offDutyCount = client.guards.filter(g => g.duty_status === 'OFF_DUTY').length;
                  const deploymentRate = Math.round((onDutyCount / client.total_guards) * 100);
                  
                  return (
                    <TableRow key={client.client_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{client.client_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.company_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {client.client_contact}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {client.total_guards} guards
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="font-medium text-success">{onDutyCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <span className="font-medium text-warning">{offDutyCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={`font-medium ${deploymentRate >= 80 ? 'text-success' : deploymentRate >= 60 ? 'text-warning' : 'text-destructive'}`}>
                            {deploymentRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!selectedClientId && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Client</h3>
          <p className="text-muted-foreground">Choose a client from the dropdown above to view their assigned guards and deployment details.</p>
        </div>
      )}
    </div>
  );
}