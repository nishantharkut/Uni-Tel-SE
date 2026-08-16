
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Calculator } from 'lucide-react';
import { useCreateAttendance, useUpdateAttendance, useSemesters } from '@/hooks/useAcademic';
import { useSubjectsBySemester } from '@/hooks/useSubjects';
import type { AttendanceRecord } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterId?: string;
  editingRecord?: AttendanceRecord | null;
}

export function AttendanceDialog({ 
  open, 
  onOpenChange, 
  semesterId,
  editingRecord 
}: AttendanceDialogProps) {
  const [formData, setFormData] = useState({
    subject_name: '',
    total_classes: 0,
    attended_classes: 0,
    note: '',
    semester_id: semesterId || ''
  });

  const { data: semesters = [] } = useSemesters();
  const { data: semesterSubjects = [] } = useSubjectsBySemester(formData.semester_id || semesterId || '');
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const { toast } = useToast();
  
  // Get existing attendance subject names to exclude from dropdown (if needed)
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  // Filter out subjects that already have attendance records (if we have access to records)
  const selectableSubjects = semesterSubjects;

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        subject_name: editingRecord.subject_name,
        total_classes: editingRecord.total_classes,
        attended_classes: editingRecord.attended_classes,
        note: editingRecord.note || '',
        semester_id: editingRecord.semester_id
      });
    } else {
      resetForm();
    }
  }, [editingRecord, semesterId, resetForm]);

  const resetForm = useCallback(() => {
    setFormData({
      subject_name: '',
      total_classes: 0,
      attended_classes: 0,
      note: '',
      semester_id: semesterId || ''
    });
    setUseManualEntry(false);
  }, [semesterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      } else {
        await createAttendance.mutateAsync({
          ...submitData,
          source_json_import: false
        });
      }
      
      onOpenChange(false);
      resetForm();
      toast({
        title: editingRecord ? 'Attendance Updated' : 'Attendance Added',
        description: `Attendance record for ${submitData.subject_name} has been ${editingRecord ? 'updated' : 'added'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Attendance',
        description: error?.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkPresent = () => {
    const newTotal = formData.total_classes + 1;
    const newAttended = formData.attended_classes + 1;
    setFormData(prev => ({
      ...prev,
      total_classes: newTotal,
      attended_classes: newAttended
    }));
  };

  const handleMarkAbsent = () => {
    const newTotal = formData.total_classes + 1;
    setFormData(prev => ({
      ...prev,
      total_classes: newTotal
    }));
  };

  const getAttendancePercentage = () => {
    if (formData.total_classes === 0) return 0;
    return Math.round((formData.attended_classes / formData.total_classes) * 100 * 100) / 100;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-100 text-green-800';
    if (percentage >= 65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? 'Edit Attendance' : 'Add Attendance Record'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!semesterId && (
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, semester_id: value, subject_name: '' });
                  setUseManualEntry(false);
                }}
                required
              >
                <SelectTrigger>
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
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="subject_name">Subject Name</Label>
              {selectableSubjects.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setUseManualEntry(!useManualEntry);
                    if (!useManualEntry) {
                      setFormData({ ...formData, subject_name: '' });
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
                onValueChange={(value) => setFormData({ ...formData, subject_name: value })}
                required
              >
                <SelectTrigger>
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
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                placeholder="e.g., Engineering Mathematics"
                required
              />
            )}
            {!useManualEntry && selectableSubjects.length === 0 && (formData.semester_id || semesterId) && (
              <p className="text-xs text-muted-foreground mt-1">
                No subjects available for this semester. Please add subjects first or enter manually.
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-3">
            <Label>Quick Actions</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleMarkPresent}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Mark Present
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleMarkAbsent}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              >
                <UserX className="w-4 h-4 mr-2" />
                Mark Absent
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              These buttons will increment total classes and attended classes accordingly
            </p>
          </div>

          {/* Manual Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attended_classes">Attended Classes</Label>
              <Input
                id="attended_classes"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.attended_classes === 0 ? '' : String(formData.attended_classes)}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '') {
                    setFormData({ ...formData, attended_classes: 0 });
                    return;
                  }
                  if (/^\d+$/.test(value)) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      const maxValue = formData.total_classes || undefined;
                      const finalValue = maxValue ? Math.min(numValue, maxValue) : numValue;
                      setFormData({ ...formData, attended_classes: finalValue });
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setFormData({ ...formData, attended_classes: 0 });
                  }
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_classes">Total Classes</Label>
              <Input
                id="total_classes"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.total_classes === 0 ? '' : String(formData.total_classes)}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '') {
                    setFormData({ ...formData, total_classes: 0 });
                    return;
                  }
                  if (/^\d+$/.test(value)) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      setFormData({ 
                        ...formData, 
                        total_classes: numValue,
                        attended_classes: numValue ? Math.min(formData.attended_classes || 0, numValue) : formData.attended_classes
                      });
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setFormData({ ...formData, total_classes: 0 });
                  }
                }}
                required
              />
            </div>
          </div>

          {formData.total_classes > 0 && (
            <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="text-sm">Attendance: {getAttendancePercentage()}%</span>
              </div>
              <Badge className={getPercentageColor(getAttendancePercentage())}>
                {getAttendancePercentage() >= 75 ? 'Good' : getAttendancePercentage() >= 65 ? 'Warning' : 'Critical'}
              </Badge>
            </div>
          )}

          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRecord ? 'Update' : 'Add'} Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
