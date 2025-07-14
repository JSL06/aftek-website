import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple auth check - admin/aftek2024
    if (credentials.username === 'admin' && credentials.password === 'aftek2024') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Use admin/aftek2024');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <Card className="w-96 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Aftek Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="aftek2024"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="mt-1"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              Login to Admin Panel
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Demo credentials: admin / aftek2024
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;