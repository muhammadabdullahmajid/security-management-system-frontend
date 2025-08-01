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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Edit,
  Package,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw
} from 'lucide-react';

// Mock data
const mockInventoryRecords = [
  {
    id: 1,
    guard_name: 'John Doe',
    guard_contact: '+1234567890',
    item_name: 'Security Uniform',
    item_type: 'uniform',
    quantity: 2,
    issue_date: '2024-01-15',
    condition_on_issue: 'good',
    cost: 5000,
    notes: 'Complete set with jacket and pants',
    return_date: null,
    status: 'ISSUED',
    condition_on_return: null
  },
  {
    id: 2,
    guard_name: 'Sarah Smith',
    guard_contact: '+1234567891',
    item_name: 'Walkie Talkie',
    item_type: 'radio',
    quantity: 1,
    issue_date: '2024-02-01',
    condition_on_issue: 'good',
    cost: 3500,
    notes: 'Model: Motorola XTN446',
    return_date: null,
    status: 'ISSUED',
    condition_on_return: null
  },
  {
    id: 3,
    guard_name: 'Mike Johnson',
    guard_contact: '+1234567892',
    item_name: 'Security Baton',
    item_type: 'baton',
    quantity: 1,
    issue_date: '2024-01-20',
    condition_on_issue: 'good',
    cost: 1200,
    notes: 'Standard issue baton with holster',
    return_date: '2024-03-01',
    status: 'RETURNED',
    condition_on_return: 'good'
  }
];

const mockGuards = [
  { name: 'John Doe', contact: '+1234567890' },
  { name: 'Sarah Smith', contact: '+1234567891' },
  { name: 'Mike Johnson', contact: '+1234567892' },
  { name: 'Emily Davis', contact: '+1234567893' }
];

const itemTypes = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'baton', label: 'Baton' },
  { value: 'radio', label: 'Radio/Walkie-Talkie' },
  { value: 'flashlight', label: 'Flashlight' },
  { value: 'whistle', label: 'Whistle' },
  { value: 'other', label: 'Other' }
];

const conditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' }
];

const statusColors = {
  ISSUED: 'bg-primary text-primary-foreground',
  RETURNED: 'bg-success text-success-foreground',
  DAMAGED: 'bg-destructive text-destructive-foreground',
  LOST: 'bg-warning text-warning-foreground'
};

const statusIcons = {
  ISSUED: Package,
  RETURNED: CheckCircle2,
  DAMAGED: AlertTriangle,
  LOST: XCircle
};

export default function Inventory() {
  const [inventoryRecords, setInventoryRecords] = useState(mockInventoryRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [returningRecord, setReturningRecord] = useState(null);

  const [formData, setFormData] = useState({
    guard_contact: '',
    item_name: '',
    item_type: '',
    quantity: '1',
    condition_on_issue: 'good',
    cost: '',
    notes: ''
  });

  const [returnData, setReturnData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    status: 'RETURNED',
    condition_on_return: 'good',
    notes: ''
  });

  const filteredRecords = inventoryRecords.filter(record => {
    const matchesSearch = record.guard_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.item_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedGuard = mockGuards.find(g => g.contact === formData.guard_contact);
    
    if (editingRecord) {
      setInventoryRecords(inventoryRecords.map(record => 
        record.id === editingRecord.id 
          ? { 
              ...record, 
              ...formData,
              guard_name: selectedGuard?.name,
              quantity: parseInt(formData.quantity),
              cost: parseFloat(formData.cost) || 0
            }
          : record
      ));
    } else {
      setInventoryRecords([...inventoryRecords, {
        ...formData,
        id: Date.now(),
        guard_name: selectedGuard?.name,
        quantity: parseInt(formData.quantity),
        cost: parseFloat(formData.cost) || 0,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'ISSUED',
        return_date: null,
        condition_on_return: null
      }]);
    }
    resetForm();
  };

  const handleReturn = (e) => {
    e.preventDefault();
    setInventoryRecords(inventoryRecords.map(record => 
      record.id === returningRecord.id 
        ? { ...record, ...returnData }
        : record
    ));
    setIsReturnDialogOpen(false);
    setReturningRecord(null);
    setReturnData({
      return_date: new Date().toISOString().split('T')[0],
      status: 'RETURNED',
      condition_on_return: 'good',
      notes: ''
    });
  };

  const resetForm = () => {
    setFormData({
      guard_contact: '',
      item_name: '',
      item_type: '',
      quantity: '1',
      condition_on_issue: 'good',
      cost: '',
      notes: ''
    });
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      guard_contact: record.guard_contact,
      item_name: record.item_name,
      item_type: record.item_type,
      quantity: record.quantity.toString(),
      condition_on_issue: record.condition_on_issue,
      cost: record.cost.toString(),
      notes: record.notes
    });
    setIsDialogOpen(true);
  };

  const handleInitiateReturn = (record) => {
    setReturningRecord(record);
    setIsReturnDialogOpen(true);
  };

  const issuedCount = inventoryRecords.filter(r => r.status === 'ISSUED').length;
  const returnedCount = inventoryRecords.filter(r => r.status === 'RETURNED').length;
  const damagedCount = inventoryRecords.filter(r => r.status === 'DAMAGED').length;
  const totalCost = inventoryRecords.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track equipment and uniforms issued to security guards</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-medium">
              <Plus className="h-4 w-4 mr-2" />
              Issue Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Inventory Record' : 'Issue New Item'}</DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update inventory item details' : 'Record a new item being issued to a guard'}
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
                  <Label htmlFor="item_type">Item Type *</Label>
                  <Select value={formData.item_type} onValueChange={(value) => setFormData({...formData, item_type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  required
                  className="mt-1"
                  placeholder="e.g., Security Uniform, Walkie Talkie"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition on Issue</Label>
                  <Select value={formData.condition_on_issue} onValueChange={(value) => setFormData({...formData, condition_on_issue: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cost">Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="mt-1"
                  placeholder="Any additional details about the item..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  {editingRecord ? 'Update Record' : 'Issue Item'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Return Dialog */}
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Item</DialogTitle>
              <DialogDescription>
                Record the return of {returningRecord?.item_name} from {returningRecord?.guard_name}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <Label htmlFor="return_date">Return Date</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={returnData.return_date}
                  onChange={(e) => setReturnData({...returnData, return_date: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="return_status">Status</Label>
                <Select value={returnData.status} onValueChange={(value) => setReturnData({...returnData, status: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="return_condition">Condition on Return</Label>
                <Select value={returnData.condition_on_return} onValueChange={(value) => setReturnData({...returnData, condition_on_return: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="return_notes">Return Notes</Label>
                <Textarea
                  id="return_notes"
                  value={returnData.notes}
                  onChange={(e) => setReturnData({...returnData, notes: e.target.value})}
                  className="mt-1"
                  placeholder="Any notes about the return..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-primary">
                  Process Return
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
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
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Items Issued</p>
                <p className="text-2xl font-bold text-primary">{issuedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Returned</p>
                <p className="text-2xl font-bold text-success">{returnedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Damaged/Lost</p>
                <p className="text-2xl font-bold text-destructive">{damagedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-warning">₹{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Records Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Inventory Records</CardTitle>
          <CardDescription>Track all equipment and uniform issuance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All Items</TabsTrigger>
                <TabsTrigger value="issued" onClick={() => setStatusFilter('ISSUED')}>Issued</TabsTrigger>
                <TabsTrigger value="returned" onClick={() => setStatusFilter('RETURNED')}>Returned</TabsTrigger>
              </TabsList>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
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
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const StatusIcon = statusIcons[record.status];
                      return (
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
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{record.item_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{record.item_type}</span>
                          </TableCell>
                          <TableCell>{record.quantity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(record.issue_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              ₹{record.cost.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[record.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {record.status}
                            </Badge>
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
                              {record.status === 'ISSUED' && (
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => handleInitiateReturn(record)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Return
                                </Button>
                              )}
                            </div>
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