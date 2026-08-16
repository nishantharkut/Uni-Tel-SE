import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, GraduationCap } from 'lucide-react';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject, useSemesters } from '@/hooks/useAcademic';
import { gradeToPoints, getGradeColor, computeSGPA } from '@/utils/gradeCalculations';
import type { Subject } from '@/services/academicService';
import { SkeletonList } from '@/components/ui/skeleton';

const GRADES = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I'];

interface GradeEditorProps {
  semesterId?: string;
}

export function GradeEditor({ semesterId }: GradeEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    credits: 1,
    grade: '',
    semester_id: semesterId || '',
    source_json_import: false
  });

  const { data: subjects = [], isLoading } = useSubjects();
  const { data: semesters = [] } = useSemesters();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const filteredSubjects = semesterId 
    ? subjects.filter((subject: { semester_id: string }) => subject.semester_id === semesterId)
    : subjects;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          updates: formData
        });
      } else {
        await createSubject.mutateAsync(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the mutation's onError callback which shows a toast
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      credits: subject.credits,
      grade: subject.grade || '',
      semester_id: subject.semester_id,
      source_json_import: subject.source_json_import
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      await deleteSubject.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      credits: 1,
      grade: '',
      semester_id: semesterId || '',
      source_json_import: false
    });
  };

  const getSemesterNumber = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester?.number || 'Unknown';
  };

  const getPreviewSGPA = () => {
    if (!formData.grade || !formData.credits) return null;
    const currentSubjects = filteredSubjects.filter(s => s.id !== editingSubject?.id);
    const previewSubjects = [
      ...currentSubjects,
      { credits: formData.credits, grade: formData.grade }
    ];
    return computeSGPA(previewSubjects);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonList items={3} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Subjects & Grades
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering Mathematics"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.credits === 0 ? '' : String(formData.credits)}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value === '') {
                      setFormData({ ...formData, credits: 0 });
                      return;
                    }
                    if (/^\d+$/.test(value)) {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 6) {
                        setFormData({ ...formData, credits: numValue });
                      }
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.credits === 0) {
                      setFormData({ ...formData, credits: 1 });
                    }
                  }}
                  required
                />
              </div>

              {!semesterId && (
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select 
                    value={formData.semester_id} 
                    onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
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
                <Label htmlFor="grade">Grade</Label>
                <Select 
                  value={formData.grade} 
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade} ({gradeToPoints(grade)} points)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.grade && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Grade Points: {gradeToPoints(formData.grade)}</p>
                  {getPreviewSGPA() && (
                    <p className="text-sm text-muted-foreground">
                      Preview SGPA: {getPreviewSGPA()?.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubject ? 'Update' : 'Create'} Subject
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No subjects added yet</p>
          </div>
        ) : (
          filteredSubjects.map((subject: { id: string; name: string; credits: number; grade?: string; semester_id: string }) => (
            <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{subject.name}</h4>
                  {subject.grade && (
                    <Badge className={getGradeColor(subject.grade)}>
                      {subject.grade}
                    </Badge>
                  )}
                  {!semesterId && (
                    <Badge variant="outline">
                      Sem {getSemesterNumber(subject.semester_id)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{subject.credits} credits</span>
                  {subject.grade_points && (
                    <span>{subject.grade_points} points</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(subject.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
