
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSemesters, useCreateSemester } from '@/hooks/useAcademic';
import { useAcademicSummary } from '@/hooks/useAcademicSummary';
import { LazySemesterCard } from '@/components/academic/LazySemesterCard';
import { LazyImportExport } from '@/components/academic/LazyImportExport';
import { useToast } from '@/hooks/use-toast';
import { FormFieldError } from '@/components/ui/form-field-error';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';
import { 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Award, 
  TrendingUp,
  Calendar,
  Target,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function Semesters() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [semesterNumber, setSemesterNumber] = useState<number | ''>('');
  const [touched, setTouched] = useState(false);
  
  const { data: semesters = [], isLoading } = useSemesters();
  const { data: academicSummary } = useAcademicSummary();
  const createSemester = useCreateSemester();
  const { toast } = useToast();

  const existingNumbers = semesters.map(s => s.number);
  
  // Only validate if field has been touched and has a value
  const error = touched && semesterNumber !== '' ? (
    existingNumbers.includes(Number(semesterNumber))
      ? `Semester ${semesterNumber} already exists`
      : Number(semesterNumber) < 1 || Number(semesterNumber) > 12
      ? 'Semester number must be between 1 and 12'
      : null
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    // Validate
    if (semesterNumber === '' || semesterNumber === null || semesterNumber === undefined) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a semester number.',
        variant: 'destructive',
      });
      return;
    }

    const numValue = Number(semesterNumber);
    if (isNaN(numValue)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid number.',
        variant: 'destructive',
      });
      return;
    }

    if (existingNumbers.includes(numValue)) {
      toast({
        title: 'Validation Error',
        description: `Semester ${numValue} already exists. Please choose a different number.`,
        variant: 'destructive',
      });
      return;
    }

    if (numValue < 1 || numValue > 12) {
      toast({
        title: 'Validation Error',
        description: 'Semester number must be between 1 and 12.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSemester.mutateAsync({
        number: numValue,
        total_credits: 0,
        source_json_import: false
      });
      toast({
        title: 'Semester Created',
        description: `Semester ${numValue} has been created successfully.`,
      });
      setIsDialogOpen(false);
      setSemesterNumber('');
      setTouched(false);
    } catch (error: any) {
      toast({
        title: 'Error Creating Semester',
        description: error?.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading your semesters" 
        subMessage="Preparing your academic records..."
        variant="default"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl">
        {/* Hero Section - Semesters */}
        <div className="relative overflow-hidden rounded-3xl color-primary p-6 sm:p-8 lg:p-12 shadow-2xl mb-8 lg:mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                      Semesters
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base">
                      Organize your academic journey by semesters
                    </p>
                  </div>
                </div>
                
                {academicSummary?.cgpa && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Current CGPA</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{academicSummary.cgpa.toFixed(2)}</p>
                      </div>
                    </div>
                    <Badge className="color-accent border-0 px-4 py-2 text-sm font-semibold">
                      <Activity className="w-4 h-4 mr-2" />
                      {semesters.length} Semester{semesters.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <LazyImportExport />
          </div>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                // Reset form when dialog closes
                setSemesterNumber('');
                setTouched(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto color-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Add Semester</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
              <DialogHeader className="space-y-4">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 rounded-xl color-primary-light">
                    <GraduationCap className="w-6 h-6 text-academic-primary" />
                  </div>
                  <span className="font-bold">Add New Semester</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="number" className="text-sm font-semibold text-foreground">
                    Semester Number
                  </Label>
                  <Input
                    id="number"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={semesterNumber === '' ? '' : String(semesterNumber)}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      // Allow empty string for clearing
                      if (value === '') {
                        setSemesterNumber('');
                        setTouched(false); // Reset touched when cleared
                        return;
                      }
                      // Only allow digits
                      if (/^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          setSemesterNumber(numValue);
                          // Revalidate if already touched
                          if (touched) {
                            // Validation will happen automatically via error calculation
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      if (semesterNumber !== '') {
                        setTouched(true);
                      }
                    }}
                    required
                    className={cn(
                      "h-12 text-base rounded-xl border-2 focus:border-academic-primary transition-colors",
                      error && "border-destructive focus:border-destructive"
                    )}
                    placeholder="Enter semester number (1-12)"
                    aria-invalid={!!error}
                    aria-describedby={error ? "semester-number-error" : undefined}
                  />
                  <FormFieldError error={error || undefined} id="semester-number-error" />
                  {!error && touched && semesterNumber !== '' && Number(semesterNumber) >= 1 && Number(semesterNumber) <= 12 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ✓ Semester number is available
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                    className="font-medium h-12 px-6 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="color-primary text-white font-semibold h-12 px-6 rounded-xl shadow-lg"
                    disabled={createSemester.isPending || !!error || semesterNumber === '' || semesterNumber === null}
                  >
                    {createSemester.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Semesters List */}
        {semesters.length > 0 ? (
          <div className="space-y-6 lg:space-y-8">
            {semesters
              .sort((a, b) => b.number - a.number) // Most recent first
              .map((semester) => (
                <LazySemesterCard key={semester.id} semester={semester} />
              ))}
          </div>
        ) : (
          <div className="text-center py-16 lg:py-24">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="p-6 rounded-3xl color-secondary-light w-24 h-24 mx-auto flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-academic-secondary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full color-accent-light flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-academic-secondary" />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">Start Your Academic Journey</h3>
              <p className="text-muted-foreground mb-8 text-sm lg:text-base leading-relaxed">
                Create your first semester to begin organizing subjects, tracking attendance, and monitoring your academic progress.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="color-primary text-white font-semibold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Semester
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
