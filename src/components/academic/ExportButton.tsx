import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { useSemesters, useSubjects, useAttendance, useMarks, useAcademicSummary } from '@/hooks/useAcademic';
import { useToast } from '@/hooks/use-toast';

export function ExportButton() {
  const { data: semesters = [] } = useSemesters();
  const { data: subjects = [] } = useSubjects();
  const { data: attendance = [] } = useAttendance();
  const { data: marks = [] } = useMarks();
  const { data: summary } = useAcademicSummary();
  const { toast } = useToast();

  const handleExportPDF = () => {
    try {
      exportToPDF(
        semesters,
        subjects,
        attendance,
        marks,
        summary?.cgpa || null
      );
      toast({
        title: 'Export Successful',
        description: 'Your academic transcript has been exported as PDF.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(
        semesters,
        subjects,
        attendance,
        marks,
        summary?.cgpa || null
      );
      toast({
        title: 'Export Successful',
        description: 'Your academic data has been exported as Excel file.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the Excel file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const hasData = semesters.length > 0 || subjects.length > 0 || attendance.length > 0 || marks.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs sm:text-sm">
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Export</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 sm:w-48">
        <DropdownMenuItem 
          onClick={handleExportPDF}
          disabled={!hasData}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportExcel}
          disabled={!hasData}
          className="gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {!hasData && 'No data to export'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

