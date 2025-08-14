import { usePageVisibility } from '@/hooks/usePageVisibility';
import PageDisabled from './PageDisabled';

interface ProtectedPageProps {
  pageName: string;
  children: React.ReactNode;
}

const ProtectedPage = ({ pageName, children }: ProtectedPageProps) => {
  const { isPageVisible } = usePageVisibility();

  if (!isPageVisible(pageName as any)) {
    return <PageDisabled pageName={pageName} />;
  }

  return <>{children}</>;
};

export default ProtectedPage; 