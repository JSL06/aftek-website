import React, { useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface UnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
}

export const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setHasUnsavedChanges } = useAdminStore();

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，確定要離開嗎？';
        return '您有未保存的更改，確定要離開嗎？';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        const confirmed = window.confirm('您有未保存的更改，確定要離開嗎？');
        if (!confirmed) {
          window.history.pushState(null, '', location.pathname);
        } else {
          setHasUnsavedChanges(false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location.pathname, setHasUnsavedChanges]);

  // Reset unsaved changes when component unmounts
  useEffect(() => {
    return () => {
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(false);
      }
    };
  }, [hasUnsavedChanges, setHasUnsavedChanges]);

  return null; // This component doesn't render anything
};

export default UnsavedChangesWarning;
