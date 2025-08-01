import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Building2,
  UserCheck,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalGuards: 24,
    totalClients: 8,
    guardsOnDuty: 18,
    monthlySalary: 125000,
    inventoryIssued: 156,
    pendingReturns: 12
  };

  const recentActivity = [
    { id: 1, action: 'Guard John Doe assigned to Alpha Corp', time: '2 hours ago', type: 'assignment' },
    { id: 2, action: 'Salary processed for March 2024', time: '4 hours ago', type: 'salary' },
    { id: 3, action: 'Uniform issued to Mike Johnson', time: '6 hours ago', type: 'inventory' },
    { id: 4, action: 'New client Beta Solutions added', time: '1 day ago', type: 'client' }
  ];

  const topPerformers = [
    { name: 'John Doe', contact: '+1234567890', rating: 98, assignments: 15 },
    { name: 'Sarah Smith', contact: '+1234567891', rating: 96, assignments: 12 },
    { name: 'Mike Johnson', contact: '+1234567892', rating: 94, assignments: 18 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Welcome to SecureGuard Dashboard</h1>
        <p className="text-primary-foreground/80">
          Manage your security operations efficiently with real-time insights and comprehensive controls.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guards</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalGuards}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+1</span> new client this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guards on Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.guardsOnDuty}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.guardsOnDuty / stats.totalGuards) * 100)}% deployment rate
            </p>
            <Progress 
              value={(stats.guardsOnDuty / stats.totalGuards) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.monthlySalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total payroll for current month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inventoryIssued}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">{stats.pendingReturns}</span> pending returns
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">96%</div>
            <p className="text-xs text-muted-foreground">
              Average guard rating
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across your security operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <div className="mt-1">
                  {activity.type === 'assignment' && <UserCheck className="h-4 w-4 text-primary" />}
                  {activity.type === 'salary' && <DollarSign className="h-4 w-4 text-success" />}
                  {activity.type === 'inventory' && <Package className="h-4 w-4 text-warning" />}
                  {activity.type === 'client' && <Building2 className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Top Performing Guards
            </CardTitle>
            <CardDescription>Guards with highest ratings this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((guard, index) => (
              <div key={guard.contact} className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{guard.name}</p>
                  <p className="text-sm text-muted-foreground">{guard.contact}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {guard.rating}% rating
                  </Badge>
                  <p className="text-xs text-muted-foreground">{guard.assignments} assignments</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}