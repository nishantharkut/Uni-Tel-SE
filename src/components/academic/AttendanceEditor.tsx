import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, Calendar, Minus, Plus as PlusIcon } from 'lucide-react';
import { useAttendance, useCreateAttendance, useUpdateAttendance, useDeleteAttendance, useSemesters } from '@/hooks/useAcademic';
import { useSubjects, useSubjectsBySemester } from '@/hooks/useSubjects';
import { getAttendanceStatus } from '@/utils/gradeCalculations';
import type { AttendanceRecord } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';
import { FormFieldError } from '@/components/ui/form-field-error';
import { cn } from '@/lib/utils';
import { SkeletonAttendanceCard } from '@/components/ui/skeleton';

interface AttendanceEditorProps {
  semesterId?: string;
}

export function AttendanceEditor({ semesterId }: AttendanceEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    subject_name: '',
    total_classes: 0,
    attended_classes: 0,
    note: '',
    semester_id: semesterId || '',
    source_json_import: false
  });
  const [touched, setTouched] = useState({
    subject_name: false,
    total_classes: false,
    attended_classes: false,
    semester_id: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const { data: attendanceRecords = [], isLoading } = useAttendance();
  const { data: semesters = [] } = useSemesters();
  const { data: allSubjects = [] } = useSubjects();
  const { data: semesterSubjects = [] } = useSubjectsBySemester(formData.semester_id || semesterId || '');
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  const { toast } = useToast();
  
  // Determine which subjects to show based on whether semester is selected
  const availableSubjects = (formData.semester_id || semesterId) 
    ? semesterSubjects 
    : allSubjects;
  
  // Get existing attendance subject names to exclude from dropdown
  const existingAttendanceSubjects = filteredRecords
    .filter(r => (!editingRecord || r.id !== editingRecord.id))
    .map(r => r.subject_name.toLowerCase().trim());
  
  // Filter out subjects that already have attendance records
  const selectableSubjects = availableSubjects.filter((subject: { name: string }) => 
    !existingAttendanceSubjects.includes(subject.name.toLowerCase().trim())
  );
  
  // Allow manual entry option
  const [useManualEntry, setUseManualEntry] = useState(false);

  const filteredRecords = semesterId 
    ? attendanceRecords.filter((record: { semester_id: string }) => record.semester_id === semesterId)
    : attendanceRecords;

  // Get existing subject names for duplicate detection
  const existingNames = filteredRecords
    .filter(r => (!editingRecord || r.id !== editingRecord.id))
    .map(r => r.subject_name.toLowerCase().trim());

  // Validation functions
  const validateField = (field: keyof typeof formData, value: any): string | null => {
    switch (field) {
      case 'subject_name':
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Subject name is required';
        if (trimmed.length < 2) return 'Subject name must be at least 2 characters';
        if (existingNames.includes(trimmed.toLowerCase())) {
          return 'An attendance record for this subject already exists';
        }
        return null;
      case 'total_classes':
        const total = Number(value) || 0;
        if (total < 0) return 'Total classes cannot be negative';
        if (total > 1000) return 'Total classes seems too high. Please verify.';
        return null;
      case 'attended_classes':
        const attended = Number(value) || 0;
        const totalClasses = Number(formData.total_classes) || 0;
        if (attended < 0) return 'Attended classes cannot be negative';
        if (attended > totalClasses && totalClasses > 0) {
          return `Attended classes (${attended}) cannot exceed total classes (${totalClasses})`;
        }
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

    // Special case: if total_classes changes, revalidate attended_classes
    if (field === 'total_classes' && touched.attended_classes) {
      const attendedError = validateField('attended_classes', formData.attended_classes);
      setErrors(prev => ({ ...prev, attended_classes: attendedError || undefined }));
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
      if (field === 'note' || field === 'source_json_import') return;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      subject_name: true,
      total_classes: true,
      attended_classes: true,
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
    
    // Convert null values to appropriate defaults
    const submitData = {
      ...formData,
      total_classes: formData.total_classes || 0,
      attended_classes: formData.attended_classes || 0
    };
    
    try {
      if (editingRecord) {
        await updateAttendance.mutateAsync({
          id: editingRecord.id,
          updates: submitData
        });
        toast({
          title: 'Attendance Updated',
          description: `Attendance record for ${submitData.subject_name} has been updated successfully.`,
        });
      } else {
        await createAttendance.mutateAsync(submitData);
        toast({
          title: 'Attendance Added',
          description: `Attendance record for ${submitData.subject_name} has been added successfully.`,
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error Saving Attendance',
        description: error?.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      subject_name: record.subject_name,
      total_classes: record.total_classes,
      attended_classes: record.attended_classes,
      note: record.note || '',
      semester_id: record.semester_id,
      source_json_import: record.source_json_import
    });
    // Check if the subject exists in the semester's subjects
    const subjectExists = availableSubjects.some((s: { name: string }) => 
      s.name.toLowerCase().trim() === record.subject_name.toLowerCase().trim()
    );
    setUseManualEntry(!subjectExists);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const record = filteredRecords.find((r: { id: string }) => r.id === id);
    const subjectName = record?.subject_name || 'this attendance record';
    
    if (confirm(`Are you sure you want to delete the attendance record for "${subjectName}"? This action cannot be undone.`)) {
      try {
        await deleteAttendance.mutateAsync(id);
        toast({
          title: 'Attendance Deleted',
          description: `Attendance record for ${subjectName} has been deleted successfully.`,
        });
      } catch (error: any) {
        toast({
          title: 'Error Deleting Attendance',
          description: error?.message || 'Failed to delete attendance record. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      subject_name: '',
      total_classes: 0,
      attended_classes: 0,
      note: '',
      semester_id: semesterId || '',
      source_json_import: false
    });
    setTouched({
      subject_name: false,
      total_classes: false,
      attended_classes: false,
      semester_id: false
    });
    setErrors({});
    setUseManualEntry(false);
  };


  const getSemesterNumber = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester?.number || 'Unknown';
  };

  const getPreviewPercentage = () => {
    if (formData.total_classes === 0) return 0;
    return Math.round((formData.attended_classes / formData.total_classes) * 100 * 100) / 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonAttendanceCard />
        <SkeletonAttendanceCard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Attendance Records
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Attendance' : 'Add Attendance Record'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

              {!semesterId && (
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Select 
                    value={formData.semester_id} 
                    onValueChange={(value) => {
                      handleFieldChange('semester_id', value);
                      handleFieldBlur('semester_id');
                      // Reset subject name when semester changes
                      handleFieldChange('subject_name', '');
                      setUseManualEntry(false);
                    }}
                  >
                    <SelectTrigger className={cn(
                      "h-11",
                      errors.semester_id && "border-destructive"
                    )}>
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
                <Label htmlFor="total_classes">Total Classes *</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => {
                      const newValue = Math.max(0, formData.total_classes - 1);
                      handleFieldChange('total_classes', newValue);
                    }}
                  >
                    <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                  </Button>
                  <Input
                    id="total_classes"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.total_classes === 0 ? '' : String(formData.total_classes)}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === '') {
                        handleFieldChange('total_classes', 0);
                        return;
                      }
                      if (/^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          handleFieldChange('total_classes', numValue);
                        }
                      }
                    }}
                    onBlur={() => handleFieldBlur('total_classes')}
                    className={cn(
                      "h-11 text-center",
                      errors.total_classes && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!errors.total_classes}
                    aria-describedby={errors.total_classes ? "total_classes-error" : undefined}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => {
                      const newValue = formData.total_classes + 1;
                      handleFieldChange('total_classes', newValue);
                    }}
                  >
                    <PlusIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <FormFieldError error={errors.total_classes} id="total_classes-error" />
              </div>

              <div>
                <Label htmlFor="attended_classes">Attended Classes *</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newValue = Math.max(0, formData.attended_classes - 1);
                      handleFieldChange('attended_classes', newValue);
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="attended_classes"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.attended_classes === 0 ? '' : String(formData.attended_classes)}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === '') {
                        handleFieldChange('attended_classes', 0);
                        return;
                      }
                      if (/^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          const maxValue = formData.total_classes || undefined;
                          const finalValue = maxValue ? Math.min(numValue, maxValue) : numValue;
                          handleFieldChange('attended_classes', finalValue);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleFieldChange('attended_classes', 0);
                      }
                      handleFieldBlur('attended_classes');
                    }}
                    className={cn(
                      "h-11 text-center",
                      errors.attended_classes && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!errors.attended_classes}
                    aria-describedby={errors.attended_classes ? "attended_classes-error" : undefined}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-10 w-10"
                    onClick={() => {
                      const newValue = formData.attended_classes + 1;
                      handleFieldChange('attended_classes', newValue);
                    }}
                  >
                    <PlusIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <FormFieldError error={errors.attended_classes} id="attended_classes-error" />
                {!errors.attended_classes && formData.total_classes > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.attended_classes} of {formData.total_classes} classes attended
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              {formData.total_classes > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Attendance: {formData.attended_classes} / {formData.total_classes}
                  </p>
                  <p className="text-sm font-medium">
                    Percentage: {getPreviewPercentage()}%
                  </p>
                  <Badge className={getAttendanceStatus(getPreviewPercentage()).color}>
                    {getAttendanceStatus(getPreviewPercentage()).status}
                  </Badge>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRecord ? 'Update' : 'Create'} Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records added yet</p>
          </div>
        ) : (
          filteredRecords.map((record: { id: string; subject_name: string; percentage?: number; attended_classes: number; total_classes: number; note?: string; semester_id: string }) => {
            const attendanceStatus = getAttendanceStatus(record.percentage || 0);
            const isLow = (record.percentage || 0) < 75;
            
            return (
              <div key={record.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow ${isLow ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{record.subject_name}</h4>
                    <Badge className={attendanceStatus.color}>
                      {attendanceStatus.status}
                    </Badge>
                    {!semesterId && (
                      <Badge variant="outline">
                        Sem {getSemesterNumber(record.semester_id)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{record.attended_classes} / {record.total_classes} classes</span>
                    <span className="font-medium">{record.percentage?.toFixed(1)}%</span>
                    {isLow && <span className="text-red-600">⚠️ Below 75%</span>}
                  </div>
                  {record.note && (
                    <p className="text-sm text-muted-foreground mt-1">{record.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(record)}
                    title="Edit attendance record"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete attendance record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
