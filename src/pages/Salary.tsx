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
import { Checkbox } from '@/components/ui/checkbox';
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
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Minus,
  FileText
} from 'lucide-react';

// Mock data
const mockSalaryRecords = [
  {
    id: 1,
    guard_name: 'John Doe',
    guard_contact: '+1234567890',
    month: 3,
    year: 2024,
    base_salary: 25000,
    deductions: 1000,
    bonus: 2000,
    final_salary: 26000,
    is_paid: true,
    payment_date: '2024-03-31',
    notes: 'Performance bonus included',
    created_at: '2024-03-01T08:00:00Z'
  },
  {
    id: 2,
    guard_name: 'Sarah Smith',
    guard_contact: '+1234567891',
    month: 3,
    year: 2024,
    base_salary: 28000,
    deductions: 500,
    bonus: 1500,
    final_salary: 29000,
    is_paid: false,
    payment_date: null,
    notes: 'Overtime bonus',
    created_at: '2024-03-01T08:00:00Z'
  },
  {
    id: 3,
    guard_name: 'Mike Johnson',
    guard_contact: '+1234567892',
    month: 2,
    year: 2024,
    base_salary: 30000,
    deductions: 800,
    bonus: 0,
    final_salary: 29200,
    is_paid: true,
    payment_date: '2024-02-29',
    notes: 'Regular salary',
    created_at: '2024-02-01T08:00:00Z'
  }
];

const mockGuards = [
  { name: 'John Doe', contact: '+1234567890', salary: 25000 },
  { name: 'Sarah Smith', contact: '+1234567891', salary: 28000 },
  { name: 'Mike Johnson', contact: '+1234567892', salary: 30000 },
  { name: 'Emily Davis', contact: '+1234567893', salary: 26000 }
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Salary() {
  const [salaryRecords, setSalaryRecords] = useState(mockSalaryRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    guard_contact: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    deductions: '',
    bonus: '',
    notes: '',
    is_paid: false,
    payment_date: ''
  });

  const filteredRecords = salaryRecords.filter(record => {
    const matchesSearch = record.guard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.guard_contact.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && record.is_paid) ||
                         (statusFilter === 'unpaid' && !record.is_paid);
    return matchesSearch && matchesStatus;
  });

  const calculateFinalSalary = (baseSalary, deductions = 0, bonus = 0) => {
    return baseSalary - deductions + bonus;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedGuard = mockGuards.find(g => g.contact === formData.guard_contact);
    const finalSalary = calculateFinalSalary(
      selectedGuard?.salary || 0,
      parseFloat(formData.deductions) || 0,
      parseFloat(formData.bonus) || 0
    );

    if (editingRecord) {
      setSalaryRecords(salaryRecords.map(record => 
        record.id === editingRecord.id 
          ? { 
              ...record, 
              ...formData,
              deductions: parseFloat(formData.deductions) || 0,
              bonus: parseFloat(formData.bonus) || 0,
              final_salary: finalSalary,
              guard_name: selectedGuard?.name
            }
          : record
      ));
    } else {
      setSalaryRecords([...salaryRecords, {
        ...formData,
        id: Date.now(),
        guard_name: selectedGuard?.name,
        base_salary: selectedGuard?.salary || 0,
        deductions: parseFloat(formData.deductions) || 0,
        bonus: parseFloat(formData.bonus) || 0,
        final_salary: finalSalary,
        created_at: new Date().toISOString()
      }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      guard_contact: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      deductions: '',
      bonus: '',
      notes: '',
      is_paid: false,
      payment_date: ''
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      guard_contact: record.guard_contact,
      month: record.month,
      year: record.year,
      deductions: record.deductions.toString(),
      bonus: record.bonus.toString(),
      notes: record.notes,
      is_paid: record.is_paid,
      payment_date: record.payment_date || ''
    });
    setIsDialogOpen(true);
  };

  const togglePaymentStatus = (recordId) => {
    setSalaryRecords(salaryRecords.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            is_paid: !record.is_paid,
            payment_date: !record.is_paid ? new Date().toISOString().split('T')[0] : null
          }
        : record
    ));
  };

  const paidCount = salaryRecords.filter(r => r.is_paid).length;
  const unpaidCount = salaryRecords.filter(r => !r.is_paid).length;
  const totalPaid = salaryRecords.filter(r => r.is_paid).reduce((sum, r) => sum + r.final_salary, 0);
  const totalPending = salaryRecords.filter(r => !r.is_paid).reduce((sum, r) => sum + r.final_salary, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salary Management</h1>
          <p className="text-muted-foreground">Manage guard salaries, deductions, and bonus payments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add Salary Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Salary Record' : 'Create Salary Record'}</DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update salary information and payment details' : 'Create a new salary record for a guard'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="guard">Select Guard *</Label>
                  <Select value={formData.guard_contact} onValueChange={(value) => setFormData({...formData, guard_contact: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a guard" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGuards.map((guard) => (
                        <SelectItem key={guard.contact} value={guard.contact}>
                          {guard.name} ({guard.contact}) - ₹{guard.salary.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Base Salary</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">
                    <span className="text-sm text-muted-foreground">
                      ₹{(mockGuards.find(g => g.contact === formData.guard_contact)?.salary || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month *</Label>
                  <Select value={formData.month.toString()} onValueChange={(value) => setFormData({...formData, month: parseInt(value)})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2023, 2022].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deductions">Deductions (₹)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bonus">Bonus (₹)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Final Salary</Label>
                <div className="mt-1 p-3 bg-primary/10 rounded-md border border-primary/20">
                  <span className="text-lg font-semibold text-primary">
                    ₹{calculateFinalSalary(
                      mockGuards.find(g => g.contact === formData.guard_contact)?.salary || 0,
                      parseFloat(formData.deductions) || 0,
                      parseFloat(formData.bonus) || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="mt-1"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({...formData, is_paid: !!checked})}
                />
                <Label htmlFor="is_paid">Mark as paid</Label>
              </div>

              {formData.is_paid && (
                <div>
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  {editingRecord ? 'Update Record' : 'Create Record'}
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
                <p className="text-sm text-muted-foreground">Paid Records</p>
                <p className="text-2xl font-bold text-success">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
          <CardDescription>Manage all salary records and payment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guard name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Final Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.guard_name}</p>
                          <p className="text-sm text-muted-foreground">{record.guard_contact}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {months[record.month - 1]} {record.year}
                      </div>
                    </TableCell>
                    <TableCell>₹{record.base_salary.toLocaleString()}</TableCell>
                    <TableCell>
                      {record.deductions > 0 && (
                        <div className="flex items-center gap-1 text-destructive">
                          <Minus className="h-3 w-3" />
                          ₹{record.deductions.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.bonus > 0 && (
                        <div className="flex items-center gap-1 text-success">
                          <Plus className="h-3 w-3" />
                          ₹{record.bonus.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">₹{record.final_salary.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={record.is_paid ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                          {record.is_paid ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={record.is_paid ? "secondary" : "default"}
                          onClick={() => togglePaymentStatus(record.id)}
                        >
                          {record.is_paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No salary records found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}