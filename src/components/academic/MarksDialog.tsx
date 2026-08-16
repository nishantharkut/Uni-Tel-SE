
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { useCreateMarks, useUpdateMarks, useSemesters, useSubjectsBySemester, useSubjects } from '@/hooks/useAcademic';
import { useMarks } from '@/hooks/useMarks';
import type { MarksRecord } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';
import { FormFieldError } from '@/components/ui/form-field-error';
import { cn } from '@/lib/utils';

// Custom exam types - user can create their own
const DEFAULT_EXAM_TYPES = ['Mid Term', 'End Term', 'Quiz', 'Assignment', 'Lab Exam', 'Viva', 'Project', 'Other'];

interface MarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterId?: string;
  editingRecord?: MarksRecord | null;
}

export function MarksDialog({ 
  open, 
  onOpenChange, 
  semesterId,
  editingRecord 
}: MarksDialogProps) {
  const [formData, setFormData] = useState({
    subject_name: '',
    exam_type: '',
    total_marks: 0,
    obtained_marks: 0,
    weightage: 100,
    semester_id: semesterId || '',
    exam_date: '',
    exam_time: ''
  });
  const [touched, setTouched] = useState({
    subject_name: false,
    exam_type: false,
    total_marks: false,
    obtained_marks: false,
    weightage: false,
    semester_id: false,
    exam_date: false,
    exam_time: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const { data: semesters = [] } = useSemesters();
  const { data: allSubjects = [] } = useSubjects();
  const { data: semesterSubjects = [] } = useSubjectsBySemester(formData.semester_id || semesterId || '');
  const { data: marksRecords = [] } = useMarks();
  const createMarks = useCreateMarks();
  const updateMarks = useUpdateMarks();
  const { toast } = useToast();
  
  // Determine which subjects to show based on whether semester is selected
  const availableSubjects = (formData.semester_id || semesterId) 
    ? semesterSubjects 
    : allSubjects;
  
  // Get existing marks records with subject_name AND exam_type combination to exclude from dropdown
  // Only exclude if the same subject AND exam_type combination already exists
  const existingMarksCombinations = marksRecords
    .filter(r => (!editingRecord || r.id !== editingRecord.id))
    .filter(r => (formData.semester_id || semesterId) ? r.semester_id === (formData.semester_id || semesterId) : true)
    .map(r => `${r.subject_name.toLowerCase().trim()}_${r.exam_type.toLowerCase().trim()}`);
  
  // Filter out subjects that already have marks records with the SAME exam_type
  // Allow same subject with different exam types
  const selectableSubjects = availableSubjects.filter((subject: { name: string }) => {
    if (!formData.exam_type) return true; // If no exam type selected yet, show all subjects
    const combination = `${subject.name.toLowerCase().trim()}_${formData.exam_type.toLowerCase().trim()}`;
    return !existingMarksCombinations.includes(combination);
  });
  
  // Allow manual entry option
  const [useManualEntry, setUseManualEntry] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      subject_name: '',
      exam_type: '',
      total_marks: 0,
      obtained_marks: 0,
      weightage: 100,
      semester_id: semesterId || '',
      exam_date: '',
      exam_time: ''
    });
    setTouched({
      subject_name: false,
      exam_type: false,
      total_marks: false,
      obtained_marks: false,
      weightage: false,
      semester_id: false,
      exam_date: false,
      exam_time: false
    });
    setErrors({});
    setUseManualEntry(false);
  }, [semesterId]);

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        subject_name: editingRecord.subject_name,
        exam_type: editingRecord.exam_type,
        total_marks: editingRecord.total_marks,
        obtained_marks: editingRecord.obtained_marks,
        weightage: (editingRecord as any).weightage || 100,
        semester_id: editingRecord.semester_id,
        exam_date: editingRecord.exam_date || '',
        exam_time: editingRecord.exam_time || ''
      });
      setTouched({
        subject_name: false,
        exam_type: false,
        total_marks: false,
        obtained_marks: false,
        weightage: false,
        semester_id: false,
        exam_date: false,
        exam_time: false
      });
      setErrors({});
      // Check if the subject exists in the semester's subjects
      const subjectExists = availableSubjects.some((s: { name: string }) => 
        s.name.toLowerCase().trim() === editingRecord.subject_name.toLowerCase().trim()
      );
      setUseManualEntry(!subjectExists);
    } else {
      resetForm();
    }
  }, [editingRecord, semesterId, resetForm, availableSubjects]);

  // Validation functions
  const validateField = (field: keyof typeof formData, value: any): string | null => {
    switch (field) {
      case 'subject_name':
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Subject name is required';
        if (trimmed.length < 2) return 'Subject name must be at least 2 characters';
        if (trimmed.length > 100) return 'Subject name must be less than 100 characters';
        return null;
      case 'exam_type':
        if (!value || !String(value).trim()) return 'Exam type is required';
        return null;
      case 'total_marks':
        const total = Number(value) || 0;
        if (total < 0) return 'Total marks cannot be negative';
        if (total > 10000) return 'Total marks seems too high. Please verify.';
        // Marks are optional - allow 0 for now
        return null;
      case 'obtained_marks':
        const obtained = Number(value) || 0;
        const totalMarks = Number(formData.total_marks) || 0;
        if (obtained < 0) return 'Obtained marks cannot be negative';
        if (obtained > totalMarks && totalMarks > 0) {
          return `Obtained marks (${obtained}) cannot exceed total marks (${totalMarks})`;
        }
        // Marks are optional - allow 0 for now
        return null;
      case 'exam_date':
        // Optional field - no validation needed
        return null;
      case 'exam_time':
        // Optional field - no validation needed
        return null;
      case 'weightage':
        const weight = Number(value) || 0;
        if (weight < 0) return 'Weightage cannot be negative';
        if (weight > 100) return 'Weightage cannot exceed 100%';
        return null;
      case 'semester_id':
        if (!value) return 'Please select a semester';
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If field was touched, validate immediately
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }

    // Special case: if total_marks changes, revalidate obtained_marks
    if (field === 'total_marks' && touched.obtained_marks) {
      const obtainedError = validateField('obtained_marks', formData.obtained_marks);
      setErrors(prev => ({ ...prev, obtained_marks: obtainedError || undefined }));
    }
    
    // Special case: if exam_type changes, update selectable subjects
    if (field === 'exam_type') {
      // This will trigger a re-render and update selectableSubjects
    }
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const validateAll = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      subject_name: true,
      exam_type: true,
      total_marks: true,
      obtained_marks: true,
      weightage: true,
      semester_id: true
    });
    return isValid;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        subject_name: formData.subject_name.trim(),
        exam_type: formData.exam_type.trim(),
        total_marks: Number(formData.total_marks) || 0,
        obtained_marks: Number(formData.obtained_marks) || 0,
        weightage: Number(formData.weightage),
        semester_id: formData.semester_id,
        exam_date: formData.exam_date || undefined,
        exam_time: formData.exam_time || undefined,
        source_json_import: false
      };

      if (editingRecord) {
        await updateMarks.mutateAsync({
          id: editingRecord.id,
          updates: payload
        });
        toast({
          title: 'Marks Updated',
          description: `Marks record for ${payload.subject_name} has been updated successfully.`,
        });
      } else {
        await createMarks.mutateAsync(payload);
        toast({
          title: 'Marks Added',
          description: `Marks record for ${payload.subject_name} has been added successfully.`,
        });
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error Saving Marks',
        description: error?.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPercentage = () => {
    if (formData.total_marks === 0) return 0;
    return Math.round((formData.obtained_marks / formData.total_marks) * 100 * 100) / 100;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? 'Edit Marks' : 'Add Marks Record'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {!semesterId && (
            <div>
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={formData.semester_id}
                onValueChange={(value) => {
                  handleFieldChange('semester_id', value);
                  handleFieldBlur('semester_id');
                }}
                required
              >
                <SelectTrigger className={cn(errors.semester_id && "border-destructive")}>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError error={errors.semester_id} />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="subject_name">Subject Name *</Label>
              {selectableSubjects.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setUseManualEntry(!useManualEntry);
                    if (!useManualEntry) {
                      // Clear subject name when switching to manual
                      handleFieldChange('subject_name', '');
                    }
                  }}
                >
                  {useManualEntry ? 'Select from list' : 'Enter manually'}
                </Button>
              )}
            </div>
            {!useManualEntry && selectableSubjects.length > 0 ? (
              <Select
                value={formData.subject_name}
                onValueChange={(value) => handleFieldChange('subject_name', value)}
              >
                <SelectTrigger className={cn(
                  "h-11",
                  errors.subject_name && "border-destructive"
                )}>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {selectableSubjects.map((subject: { id: string; name: string; credits: number }) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name} ({subject.credits} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="subject_name"
                value={formData.subject_name}
                onChange={(e) => handleFieldChange('subject_name', e.target.value)}
                onBlur={() => handleFieldBlur('subject_name')}
                placeholder="e.g., Engineering Mathematics"
                required
                className={cn(
                  "h-11 text-base",
                  errors.subject_name && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!errors.subject_name}
                aria-describedby={errors.subject_name ? "subject_name-error" : undefined}
              />
            )}
            <FormFieldError error={errors.subject_name} id="subject_name-error" />
            {!useManualEntry && selectableSubjects.length === 0 && (formData.semester_id || semesterId) && (
              <p className="text-xs text-muted-foreground mt-1">
                No subjects available for this semester. Please add subjects first or enter manually.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="exam_type">Exam Type *</Label>
            <Select
              value={formData.exam_type}
              onValueChange={(value) => {
                handleFieldChange('exam_type', value);
                handleFieldBlur('exam_type');
              }}
              required
            >
              <SelectTrigger className={cn(errors.exam_type && "border-destructive")}>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_EXAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError error={errors.exam_type} />
          </div>

          <div>
            <Label htmlFor="weightage">Weightage (%) *</Label>
            <div className="space-y-2">
              <Input
                id="weightage"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={formData.weightage === 0 ? '' : String(formData.weightage)}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '') {
                    handleFieldChange('weightage', 0);
                    return;
                  }
                  // Allow decimal numbers
                  if (/^\d*\.?\d*$/.test(value)) {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                      handleFieldChange('weightage', numValue);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleFieldChange('weightage', 100);
                  }
                  handleFieldBlur('weightage');
                }}
                required
                    className={cn(
                      "h-11",
                      errors.weightage && "border-destructive focus-visible:ring-destructive"
                    )}
                aria-invalid={!!errors.weightage}
                aria-describedby={errors.weightage ? "weightage-error" : undefined}
              />
              <FormFieldError error={errors.weightage} id="weightage-error" />
              <div className="text-sm text-muted-foreground">
                This determines how much this exam contributes to the overall subject grade (0-100%)
              </div>
            </div>
          </div>

          {formData.total_marks > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="font-medium">Performance Preview</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Raw Score:</span>
                  <div className="font-medium">
                    {formData.obtained_marks}/{formData.total_marks} ({getPercentage()}%)
                  </div>
                  <Badge className={getPercentageColor(getPercentage())}>
                    {getPerformanceLabel(getPercentage())}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Weighted Score:</span>
                  <div className="font-medium">
                    {Math.round(getPercentage() * formData.weightage / 100 * 100) / 100}%
                  </div>
                  <Badge className={getPercentageColor(Math.round(getPercentage() * formData.weightage / 100 * 100) / 100)}>
                    Weighted
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Weighted Score = Raw Percentage × Weightage ÷ 100
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                createMarks.isPending || 
                updateMarks.isPending || 
                !!errors.subject_name || 
                !!errors.exam_type || 
                !!errors.total_marks || 
                !!errors.obtained_marks || 
                !!errors.weightage || 
                !!errors.semester_id
              }
              className="w-full sm:w-auto"
            >
              {createMarks.isPending || updateMarks.isPending ? (
                <>Saving...</>
              ) : (
                <>{editingRecord ? 'Update' : 'Add'} Marks</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
