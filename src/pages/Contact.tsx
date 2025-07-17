import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

const Contact = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to prevent header overlap */}
      <div style={{ height: '80px' }}></div>
      <div className="container mx-auto p-8">
          <div className="flex flex-col items-center mb-12">
            <h1 className="uniform-page-title">{t('contact.title')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {t('contact.info.title')}
              </h2>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">📞</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t('contact.info.phone.title')}</h3>
                        <p className="text-muted-foreground">{t('contact.info.phone.value')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">🕒</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t('contact.info.hours.title')}</h3>
                        <p className="text-muted-foreground">{t('contact.info.hours.value')}</p>
                        <p className="text-muted-foreground text-sm">{t('contact.info.hours.days')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">📍</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t('contact.info.address.title')}</h3>
                        <p className="text-muted-foreground">{t('contact.info.address.value')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">✉️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t('contact.info.email.title')}</h3>
                        <p className="text-muted-foreground">{t('contact.info.email.value')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('contact.location.title')}</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">{t('contact.location.placeholder')}</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {t('contact.form.title')}
              </h2>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('contact.form.firstName')}</Label>
                        <Input id="firstName" placeholder={t('contact.form.firstName.placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('contact.form.lastName')}</Label>
                        <Input id="lastName" placeholder={t('contact.form.lastName.placeholder')} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">{t('contact.form.company')}</Label>
                      <Input id="company" placeholder={t('contact.form.company.placeholder')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.form.email')}</Label>
                      <Input id="email" type="email" placeholder={t('contact.form.email.placeholder')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                      <Input id="phone" placeholder={t('contact.form.phone.placeholder')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                      <Input id="subject" placeholder={t('contact.form.subject.placeholder')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.form.message')}</Label>
                      <Textarea 
                        id="message" 
                        placeholder={t('contact.form.message.placeholder')}
                        rows={6}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                      {t('contact.form.submit')}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      {t('contact.form.required')}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Contact;