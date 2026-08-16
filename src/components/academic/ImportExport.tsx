
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileText, HelpCircle } from 'lucide-react';
import { jsonImportService, type ImportData } from '@/services/jsonImportService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { JsonImportGuide } from './JsonImportGuide';

export function ImportExport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const data: ImportData = JSON.parse(jsonData);
      const result = await jsonImportService.importData(data);
      
      if (result.success) {
        toast({
          title: 'Import Successful',
          description: `Imported ${result.imported_counts?.semesters || 0} semesters, ${result.imported_counts?.subjects || 0} subjects, ${result.imported_counts?.attendance || 0} attendance records, and ${result.imported_counts?.marks || 0} marks records.`
        });
        
        queryClient.invalidateQueries();
        setJsonData('');
        setIsDialogOpen(false);
      } else {
        toast({
          title: 'Import Failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Invalid JSON format or import failed',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await jsonImportService.exportData();
      if (data) {
        setExportData(JSON.stringify(data, null, 2));
        toast({
          title: 'Export Successful',
          description: 'Academic data exported successfully'
        });
      } else {
        toast({
          title: 'Export Failed',
          description: 'No data found to export',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    toast({
      title: 'Copied',
      description: 'Export data copied to clipboard'
    });
  };

  const downloadAsFile = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academic-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import/Export Academic Data</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guide">
              <HelpCircle className="w-4 h-4 mr-2" />
              Guide
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide">
            <JsonImportGuide />
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div>
              <Textarea
                placeholder="Paste your academic data JSON here..."
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleImport}
                disabled={!jsonData.trim() || isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Export your current academic data</p>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Generate Export'}
              </Button>
            </div>
            
            {exportData && (
              <div>
                <Textarea
                  value={exportData}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
                <div className="flex space-x-2 mt-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    Copy to Clipboard
                  </Button>
                  <Button onClick={downloadAsFile} variant="outline" size="sm">
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
