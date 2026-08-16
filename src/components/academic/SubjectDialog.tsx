
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSubject, useUpdateSubject, useSubjects } from '@/hooks/useAcademic';
import { BookOpen, GraduationCap, Save, Plus } from 'lucide-react';
import { gradeToPoints } from '@/utils/gradeCalculations';
import { useToast } from '@/hooks/use-toast';
import { FormFieldError } from '@/components/ui/form-field-error';
import { cn } from '@/lib/utils';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterId: string;
  editingSubject?: { id: string; name: string; credits: number; grade?: string; semester_id: string } | null;
}

const GRADES = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I'];

export function SubjectDialog({ open, onOpenChange, semesterId, editingSubject }: SubjectDialogProps) {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [grade, setGrade] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [creditsTouched, setCreditsTouched] = useState(false);
  
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const { data: existingSubjects = [] } = useSubjects();
  const { toast } = useToast();

  // Get existing subject names for this semester
  const existingNames = existingSubjects
    .filter(s => s.semester_id === semesterId && (!editingSubject || s.id !== editingSubject.id))
    .map(s => s.name.toLowerCase().trim());

  // Validation functions
  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Subject name is required';
    }
    if (trimmed.length < 2) {
      return 'Subject name must be at least 2 characters';
    }
    if (trimmed.length > 100) {
      return 'Subject name must be less than 100 characters';
    }
    if (existingNames.includes(trimmed.toLowerCase())) {
      return 'A subject with this name already exists in this semester';
    }
    return null;
  };

  const validateCredits = (value: number): string | null => {
    if (!value || value < 1) {
      return 'Credits must be at least 1';
    }
    if (value > 10) {
      return 'Credits cannot exceed 10';
    }
    return null;
  };

  const nameError = nameTouched ? validateName(name) : null;
  const creditsError = creditsTouched ? validateCredits(credits) : null;

  // Reset form when dialog opens/closes or editing subject changes
  useEffect(() => {
    if (open) {
      if (editingSubject) {
        setName(editingSubject.name || '');
        setCredits(editingSubject.credits || 3);
        setGrade(editingSubject.grade || 'no-grade');
        setNameTouched(false);
        setCreditsTouched(false);
      } else {
        setName('');
        setCredits(3);
        setGrade('no-grade');
        setNameTouched(false);
        setCreditsTouched(false);
      }
    }
  }, [editingSubject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setNameTouched(true);
    setCreditsTouched(true);

    // Validate
    const nameErr = validateName(name);
    const creditsErr = validateCredits(credits);

    if (nameErr || creditsErr) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const subjectData = {
        name: name.trim(),
        credits,
        grade: grade === 'no-grade' ? null : grade,
        semester_id: semesterId,
        source_json_import: false
      };

      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          updates: subjectData
        });
        toast({
          title: 'Subject Updated',
          description: `${subjectData.name} has been updated successfully.`,
        });
      } else {
        await createSubject.mutateAsync(subjectData);
        toast({
          title: 'Subject Added',
          description: `${subjectData.name} has been added successfully.`,
        });
      }
      
      // Close dialog and reset form
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error Saving Subject',
        description: error?.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const gradePoints = grade && grade !== 'no-grade' ? gradeToPoints(grade) : 0;
  const totalPoints = gradePoints * credits;

  const isLoading = createSubject.isPending || updateSubject.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 rounded-lg bg-primary/10">
              {editingSubject ? (
                <GraduationCap className="w-6 h-6 text-primary" />
              ) : (
                <BookOpen className="w-6 h-6 text-primary" />
              )}
            </div>
            <span className="font-bold">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Subject Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameTouched) {
                  // Real-time validation after first touch
                  validateName(e.target.value);
                }
              }}
              onBlur={() => setNameTouched(true)}
              required
                className={cn(
                  "h-11 text-base",
                  nameError && "border-destructive focus-visible:ring-destructive"
                )}
              placeholder="e.g., Engineering Mathematics"
              disabled={isLoading}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            <FormFieldError error={nameError} id="name-error" />
            {!nameError && nameTouched && name.trim() && (
              <p className="text-xs text-muted-foreground mt-1">
                ✓ Subject name looks good
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits" className="text-sm font-semibold text-foreground">
                Credits *
              </Label>
              <Input
                id="credits"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={credits === 0 ? '' : String(credits)}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '') {
                    setCredits(0);
                    return;
                  }
                  if (/^\d+$/.test(value)) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                      setCredits(numValue);
                      if (creditsTouched) {
                        validateCredits(numValue);
                      }
                    }
                  }
                }}
                onBlur={() => {
                  if (credits === 0) {
                    setCredits(1);
                  }
                  setCreditsTouched(true);
                }}
                required
                className={cn(
                  "h-11 text-base",
                  creditsError && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isLoading}
                aria-invalid={!!creditsError}
                aria-describedby={creditsError ? "credits-error" : undefined}
              />
              <FormFieldError error={creditsError} id="credits-error" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-semibold text-foreground">
                Grade
              </Label>
              <Select 
                value={grade} 
                onValueChange={setGrade}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg max-h-60">
                  <SelectItem value="no-grade" className="hover:bg-accent">
                    <span className="text-muted-foreground">No Grade</span>
                  </SelectItem>
                  {GRADES.map((gradeOption) => (
                    <SelectItem key={gradeOption} value={gradeOption} className="hover:bg-accent">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-base">{gradeOption}</span>
                        <span className="text-muted-foreground ml-4 text-sm">
                          {gradeToPoints(gradeOption).toFixed(1)} pts
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {grade && grade !== 'no-grade' && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-muted-foreground/20">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Grade Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-background/50 rounded-md p-3">
                  <span className="text-muted-foreground block mb-1">Grade Points</span>
                  <span className="text-lg font-bold text-primary">{gradePoints.toFixed(1)}</span>
                </div>
                <div className="bg-background/50 rounded-md p-3">
                  <span className="text-muted-foreground block mb-1">Total Points</span>
                  <span className="text-lg font-bold text-primary">{totalPoints.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="h-12 px-6 font-medium"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading || !name.trim() || !!nameError || !!creditsError}
            >
              {isLoading ? (
                <>
                  {editingSubject ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {editingSubject ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Subject
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
