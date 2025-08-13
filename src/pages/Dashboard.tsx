import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, UserCheck, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/stat/overview")
      .then(res => {
        const data = res.data;
        setStats({
          totalGuards: data.guards.total,
          totalClients: data.clients.total,
          guardsOnDuty: data.assignments.on_duty,
          monthlySalary: data.financial.monthly_salary_paid
        });
      })
      .catch(err => console.error("Failed to fetch dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Failed to load data.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Guards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Total Guards
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.totalGuards}
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" /> Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.totalClients}
          </CardContent>
        </Card>

        {/* Guards on Duty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-500" /> Guards on Duty
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.guardsOnDuty}
          </CardContent>
        </Card>

        {/* Monthly Salary Paid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" /> Monthly Salary Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.monthlySalary.toLocaleString("en-PK", {
              style: "currency",
              currency: "PKR",
              minimumFractionDigits: 0
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
