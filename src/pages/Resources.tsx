import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const Resources = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background pt-32">
      <div className="container mx-auto px-6 mb-24">
        <div className="title-container">
          <h1 className="uniform-page-title">{t('resources.title')}</h1>
        </div>
      </div>
    </div>
  );
};

export default Resources;