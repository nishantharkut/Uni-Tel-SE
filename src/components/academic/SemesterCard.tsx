
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, TrendingUp, Plus, Trash2, Edit, GraduationCap, Award } from 'lucide-react';
import { Semester } from '@/services/academicService';
import { useSubjectsBySemester, useDeleteSemester } from '@/hooks/useAcademic';
import { useState } from 'react';
import { SubjectDialog } from './SubjectDialog';
import { getGradeColor } from '@/utils/gradeCalculations';

interface SemesterCardProps {
  semester: Semester;
}

export function SemesterCard({ semester }: SemesterCardProps) {
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; credits: number; grade?: string; semester_id: string } | null>(null);
  
  const { data: subjects = [] } = useSubjectsBySemester(semester.id);
  const deleteSemester = useDeleteSemester();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this semester? This will also delete all associated subjects, attendance, and marks.')) {
      deleteSemester.mutate(semester.id);
    }
  };

  const handleEditSubject = (e: React.MouseEvent, subject: { id: string; name: string; credits: number; grade?: string; semester_id: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(subject);
    setShowSubjectDialog(true);
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setShowSubjectDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingSubject(null);
    }
    setShowSubjectDialog(open);
  };

  return (
    <>
      <Card className="w-full hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/30 bg-gradient-to-br from-muted/20 to-muted/5">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-4 text-xl lg:text-2xl">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <span className="font-bold text-foreground">Semester {semester.number}</span>
                {semester.sgpa && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-muted-foreground font-medium">SGPA:</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 font-bold text-sm px-3 py-1 shadow-md">
                      {semester.sgpa}
                    </Badge>
                  </div>
                )}
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 w-10 p-0 transition-all duration-200"
              title="Delete semester"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 border-2 border-blue-200/50 rounded-2xl p-4 lg:p-6 text-center hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-blue-800">Subjects</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-blue-700">{subjects.length}</div>
              <p className="text-xs text-blue-600/70 mt-1">Enrolled courses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 border-2 border-purple-200/50 rounded-2xl p-4 lg:p-6 text-center hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-purple-800">Credits</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-purple-700">{semester.total_credits}</div>
              <p className="text-xs text-purple-600/70 mt-1">Total credit hours</p>
            </div>
          </div>

          {/* All Subjects */}
          {subjects.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-lg lg:text-xl font-bold text-foreground">
                  All Subjects ({subjects.length})
                </h4>
              </div>
              
              <div className="grid gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="group relative bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shrink-0">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-base lg:text-lg text-foreground line-clamp-2 leading-tight mb-2" title={subject.name}>
                              {subject.name}
                            </h5>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span className="font-semibold">{subject.credits} credits</span>
                              </span>
                              {subject.grade_points && (
                                <span className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 shrink-0" />
                                  <span className="font-semibold">{subject.grade_points} points</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm font-semibold px-3 py-1.5 rounded-lg border-2">
                            {subject.credits}cr
                          </Badge>
                          {subject.grade && (
                            <Badge className={`${getGradeColor(subject.grade)} text-sm font-bold border-2 px-3 py-1.5 rounded-lg shadow-md`}>
                              {subject.grade}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditSubject(e, subject)}
                          className="h-10 w-10 p-0 hover:bg-primary/10 border-2 border-primary/20 rounded-xl opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                          title="Edit subject"
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16 bg-gradient-to-br from-muted/20 to-muted/5 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="p-6 rounded-3xl bg-muted/30 w-20 h-20 mx-auto flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/60" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-muted-foreground">No subjects added yet</p>
                  <p className="text-sm text-muted-foreground/80">Add your first subject to start tracking your academic progress</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleAddSubject}
            className="w-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground font-bold rounded-2xl h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-3" />
            Add Subject
          </Button>
        </CardContent>
      </Card>

      <SubjectDialog
        open={showSubjectDialog}
        onOpenChange={handleDialogClose}
        semesterId={semester.id}
        editingSubject={editingSubject}
      />
    </>
  );
}
