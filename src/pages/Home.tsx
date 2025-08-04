import { Link } from 'react-router-dom';
import logo from '@/assets/Logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Building2, ClipboardList } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <h1 className="text-xl font-bold text-gray-800">Pak Public Security</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Pak Public Security
            <span className="text-primary block">Management System</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your security operations with our comprehensive management platform. 
            Handle guards, clients, duties, and inventory all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Complete Security Management Solution
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Guard Management</CardTitle>
                <CardDescription>
                  Manage guard profiles, contact info, and employment details
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Track client information, contracts, and business relationships
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Duty Assignment</CardTitle>
                <CardDescription>
                  Assign guards to clients and track shift schedules
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Complete System</CardTitle>
                <CardDescription>
                  Salary management, inventory tracking, and comprehensive reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Pak Public Security Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
