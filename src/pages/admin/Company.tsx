import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCompany = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Taiwan Aftek Co., Ltd.',
    address: 'Taipei, Taiwan',
    phone: '+886-2-1234-5678',
    email: 'info@aftek.com',
    website: 'www.aftek.com',
    description: 'Professional construction materials and solutions provider across Asia-Pacific region.',
    mission: 'To provide high-quality construction materials and innovative solutions to meet the diverse needs of the construction industry.',
    founded: '2008',
    employees: '50+',
    regions: 'Asia-Pacific'
  });

  const handleSave = () => {
    // Save logic would go here
    alert('Company information updated successfully!');
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Company Information Management</h1>
          <p className="text-primary-foreground/80">Manage company details and information</p>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="founded">Founded</Label>
                <Input
                  id="founded"
                  value={companyInfo.founded}
                  onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employees">Employees</Label>
                <Input
                  id="employees"
                  value={companyInfo.employees}
                  onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="regions">Regions</Label>
                <Input
                  id="regions"
                  value={companyInfo.regions}
                  onChange={(e) => setCompanyInfo({...companyInfo, regions: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea
                id="mission"
                value={companyInfo.mission}
                onChange={(e) => setCompanyInfo({...companyInfo, mission: e.target.value})}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" className="flex-1">
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCompany; 