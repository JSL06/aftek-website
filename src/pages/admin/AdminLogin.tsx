import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

const AdminLogin = () => {
  const { t } = useTranslation();
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
      setError(t('admin.login.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <Card className="w-96 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            {t('admin.login.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">{t('admin.login.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('admin.login.usernamePlaceholder')}
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">{t('admin.login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('admin.login.passwordPlaceholder')}
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
              {t('admin.login.loginButton')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('admin.login.demoCredentials')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;