import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PdfViewerProps {
  title: string;
  pdfUrl: string;
  downloadUrl?: string;
}

const PdfViewer = ({ title, pdfUrl, downloadUrl }: PdfViewerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl || pdfUrl;
    link.download = `${title}.pdf`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="group hover:bg-primary hover:text-primary-foreground transition-smooth">
          <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          View PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('ui.downloadPdf')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pdfUrl, '_blank')}
                className="hover:bg-blue hover:text-blue-foreground transition-smooth"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/30">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={title}
            style={{ border: 'none' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;