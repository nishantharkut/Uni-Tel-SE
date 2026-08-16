import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, FileText, Target, Calendar as CalendarIcon } from 'lucide-react';
import { useMarks, useCreateMarks, useUpdateMarks, useDeleteMarks, useSemesters, useSubjectsBySemester, useSubjects } from '@/hooks/useAcademic';
import type { MarksRecord } from '@/services/academicService';
import { SkeletonList } from '@/components/ui/skeleton';

// Default exam types - user can create custom ones
const DEFAULT_EXAM_TYPES = ['Quiz', 'Mid Term', 'End Term', 'Assignment', 'Lab Exam', 'Viva', 'Project', 'Presentation', 'Practical', 'Other'];

interface MarksEditorProps {
  semesterId?: string;
}

export function MarksEditor({ semesterId }: MarksEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MarksRecord | null>(null);
  const [formData, setFormData] = useState({
    subject_name: '',
    exam_type: '',
    total_marks: 0,
    obtained_marks: 0,
    weightage: 100,
    semester_id: semesterId || '',
    exam_date: '',
    exam_time: '',
    source_json_import: false
  });

  const [customExamTypes, setCustomExamTypes] = useState<string[]>([]);
  const [newExamType, setNewExamType] = useState('');
  const [showAddExamType, setShowAddExamType] = useState(false);

  const { data: marksRecords = [], isLoading } = useMarks();
  const { data: semesters = [] } = useSemesters();
  const { data: allSubjects = [] } = useSubjects();
  const { data: semesterSubjects = [] } = useSubjectsBySemester(formData.semester_id || semesterId || '');
  const createMarks = useCreateMarks();
  const updateMarks = useUpdateMarks();
  const deleteMarks = useDeleteMarks();
  
  // Determine which subjects to show based on whether semester is selected
  const availableSubjects = (formData.semester_id || semesterId) 
    ? semesterSubjects 
    : allSubjects;
  
  // Get existing marks records with subject_name AND exam_type combination to exclude from dropdown
  // Only exclude if the same subject AND exam_type combination already exists
  const filteredMarks = semesterId 
    ? marksRecords.filter((r: { semester_id: string }) => r.semester_id === semesterId)
    : marksRecords;
  
  const existingMarksCombinations = filteredMarks
    .filter(r => (!editingRecord || r.id !== editingRecord.id))
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

  // Load custom exam types from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('customExamTypes');
    if (saved) {
      setCustomExamTypes(JSON.parse(saved));
    }
  }, []);

  // Save custom exam types to localStorage
  const saveCustomExamTypes = (types: string[]) => {
    setCustomExamTypes(types);
    localStorage.setItem('customExamTypes', JSON.stringify(types));
  };

  // Add new custom exam type
  const handleAddExamType = () => {
    if (newExamType.trim() && !customExamTypes.includes(newExamType.trim())) {
      const updated = [...customExamTypes, newExamType.trim()];
      saveCustomExamTypes(updated);
      setFormData({ ...formData, exam_type: newExamType.trim() });
      setNewExamType('');
      setShowAddExamType(false);
    }
  };

  // Remove custom exam type
  const handleRemoveExamType = (examType: string) => {
    const updated = customExamTypes.filter(type => type !== examType);
    saveCustomExamTypes(updated);
  };

  const filteredRecords = semesterId 
    ? marksRecords.filter((record: { semester_id: string }) => record.semester_id === semesterId)
    : marksRecords;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert null values to appropriate defaults
    const submitData = {
      ...formData,
      total_marks: formData.total_marks || 0,
      obtained_marks: formData.obtained_marks || 0,
      weightage: formData.weightage || 100,
      exam_date: formData.exam_date || undefined,
      exam_time: formData.exam_time || undefined
    };
    
    try {
      if (editingRecord) {
        await updateMarks.mutateAsync({
          id: editingRecord.id,
          updates: {
            ...submitData,
            weightage: Number(submitData.weightage)
          }
        });
      } else {
        await createMarks.mutateAsync({
          ...submitData,
          weightage: Number(submitData.weightage)
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the mutation's onError callback which shows a toast
    }
  };

  const handleEdit = (record: MarksRecord) => {
    setEditingRecord(record);
    setFormData({
      subject_name: record.subject_name,
      exam_type: record.exam_type,
      total_marks: record.total_marks,
      obtained_marks: record.obtained_marks,
      weightage: (record as any).weightage || 100,
      semester_id: record.semester_id,
      exam_date: record.exam_date || '',
      exam_time: record.exam_time || '',
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
    if (confirm('Are you sure you want to delete this marks record?')) {
      await deleteMarks.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      subject_name: '',
      exam_type: '',
      total_marks: 0,
      obtained_marks: 0,
      weightage: 100,
      semester_id: semesterId || '',
      exam_date: '',
      exam_time: '',
      source_json_import: false
    });
    setUseManualEntry(false);
  };

  const getSemesterNumber = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester?.number || 'Unknown';
  };

  const getPreviewPercentage = () => {
    const total = formData.total_marks || 0;
    const obtained = formData.obtained_marks || 0;
    if (total === 0) return 0;
    return Math.round((obtained / total) * 100 * 100) / 100;
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading marks records...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Marks & Exams
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Marks
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? 'Edit Marks' : 'Add Marks Record'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!semesterId && (
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Select 
                    value={formData.semester_id} 
                    onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
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

              <div>
                <Label htmlFor="exam_type">Exam Type</Label>
                <div className="space-y-2">
                  <Select 
                    value={formData.exam_type} 
                    onValueChange={(value) => {
                      if (value === '__create_new__') {
                        setShowAddExamType(true);
                      } else {
                        setFormData({ ...formData, exam_type: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or create exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...DEFAULT_EXAM_TYPES, ...customExamTypes].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      <SelectItem value="__create_new__" className="text-blue-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Exam Type
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {showAddExamType && (
                    <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                      <Input
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value)}
                        placeholder="Enter custom exam type"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddExamType}
                        size="sm"
                        disabled={!newExamType.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddExamType(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Custom Exam Types Management */}
                  {customExamTypes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Your Custom Exam Types:</Label>
                      <div className="flex flex-wrap gap-2">
                        {customExamTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="flex items-center gap-1">
                            {type}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveExamType(type)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                        setFormData({ ...formData, weightage: 0 });
                        return;
                      }
                      // Allow decimal numbers
                      if (/^\d*\.?\d*$/.test(value)) {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                          setFormData({ ...formData, weightage: numValue });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setFormData({ ...formData, weightage: 100 });
                      }
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You can enter marks later. For now, just set the weightage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.total_marks === 0 ? '' : String(formData.total_marks)}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === '') {
                        setFormData({ ...formData, total_marks: 0 });
                        return;
                      }
                      if (/^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          setFormData({ ...formData, total_marks: numValue });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setFormData({ ...formData, total_marks: 0 });
                      }
                    }}
                    placeholder="Optional - enter later"
                  />
                </div>

                <div>
                  <Label htmlFor="obtained_marks">Obtained Marks</Label>
                  <Input
                    id="obtained_marks"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.obtained_marks === 0 ? '' : String(formData.obtained_marks)}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === '') {
                        setFormData({ ...formData, obtained_marks: 0 });
                        return;
                      }
                      if (/^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          const maxValue = formData.total_marks || undefined;
                          const finalValue = maxValue ? Math.min(numValue, maxValue) : numValue;
                          setFormData({ ...formData, obtained_marks: finalValue });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setFormData({ ...formData, obtained_marks: 0 });
                      }
                    }}
                    placeholder="Optional - enter later"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="exam_time">Exam Time</Label>
                  <Input
                    id="exam_time"
                    type="time"
                    value={formData.exam_time}
                    onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                  />
                </div>
              </div>

              {formData.exam_date && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Exam Schedule</span>
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div>Date: {new Date(formData.exam_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    {formData.exam_time && (
                      <div>Time: {new Date(`2000-01-01T${formData.exam_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const dateTime = formData.exam_date + (formData.exam_time ? `T${formData.exam_time}` : '');
                      const startDate = new Date(dateTime);
                      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
                      
                      const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
                      googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
                      googleCalendarUrl.searchParams.set('text', `${formData.subject_name} - ${formData.exam_type}`);
                      googleCalendarUrl.searchParams.set('dates', `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
                      googleCalendarUrl.searchParams.set('details', `Subject: ${formData.subject_name}\nExam Type: ${formData.exam_type}\nWeightage: ${formData.weightage}%`);
                      
                      window.open(googleCalendarUrl.toString(), '_blank');
                      toast({
                        title: 'Opening Google Calendar',
                        description: 'Add this exam to your calendar for reminders.',
                      });
                    }}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Add to Google Calendar
                  </Button>
                </div>
              )}

              {formData.total_marks > 0 && (
                <div className="p-3 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Performance Preview</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Raw Score:</span>
                      <div className="font-medium">
                        {formData.obtained_marks} / {formData.total_marks} 
                        ({getPreviewPercentage()}%)
                      </div>
                      <Badge className={getPercentageColor(getPreviewPercentage())}>
                        {getPerformanceLabel(getPreviewPercentage())}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Weighted Score:</span>
                      <div className="font-medium">
                        {Math.round(getPreviewPercentage() * formData.weightage / 100 * 100) / 100}%
                      </div>
                      <Badge className={getPercentageColor(Math.round(getPreviewPercentage() * formData.weightage / 100 * 100) / 100)}>
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
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                >
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
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No marks records added yet</p>
          </div>
        ) : (
          Object.entries(
            filteredRecords.reduce((groups: Record<string, MarksRecord[]>, record: MarksRecord) => {
              const key = record.subject_name;
              if (!groups[key]) groups[key] = [];
              groups[key].push(record);
              return groups;
            }, {})
          ).map(([subjectName, records]: [string, MarksRecord[]]) => (
            <div key={subjectName} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {subjectName}
                {!semesterId && records[0] && (
                  <Badge variant="outline">
                    Sem {getSemesterNumber(records[0].semester_id)}
                  </Badge>
                )}
              </h4>
              <div className="grid gap-2">
                {records.map((record: MarksRecord) => (
                  <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-md gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="min-w-fit">
                          {record.exam_type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {record.obtained_marks} / {record.total_marks}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-academic-primary">
                          {record.total_marks > 0 && record.percentage != null
                            ? `${record.percentage.toFixed(1)}%`
                            : record.total_marks === 0
                            ? 'N/A'
                            : '0%'}
                        </span>
                        <Badge className={getPercentageColor(record.percentage ?? (record.total_marks > 0 ? 0 : 0))}>
                          {getPerformanceLabel(record.percentage ?? (record.total_marks > 0 ? 0 : 0))}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
