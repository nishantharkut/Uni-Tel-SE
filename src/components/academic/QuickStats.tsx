import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BookOpen, Calendar, Target, Award, Zap } from 'lucide-react';
import type { Semester, Subject, AttendanceRecord, MarksRecord } from '@/services/academicService';
import { computeCGPA } from '@/utils/gradeCalculations';

interface QuickStatsProps {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
  currentCGPA: number | null;
}

export function QuickStats({
  semesters,
  subjects,
  attendance,
  marks,
  currentCGPA
}: QuickStatsProps) {
  // Calculate quick stats
  const totalSubjects = subjects.length;
  const gradedSubjects = subjects.filter(s => s.grade).length;
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalSemesters = semesters.length;
  
  const validAttendance = attendance.filter(att => att.total_classes > 0);
  const avgAttendance = validAttendance.length > 0
    ? Math.round(validAttendance.reduce((sum, att) => {
        const pct = (att.attended_classes / att.total_classes) * 100;
        return sum + pct;
      }, 0) / validAttendance.length)
    : 0;

  const validMarks = marks.filter(m => m.total_marks > 0);
  const avgMarks = validMarks.length > 0
    ? Math.round(validMarks.reduce((sum, m) => {
        const pct = (m.obtained_marks / m.total_marks) * 100;
        return sum + pct;
      }, 0) / validMarks.length)
    : 0;

  const excellentGrades = subjects.filter(s => {
    const grade = s.grade;
    return grade && ['S', 'A+', 'A'].includes(grade);
  }).length;

  const stats = [
    {
      label: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      subLabel: `${gradedSubjects} graded`
    },
    {
      label: 'Total Credits',
      value: totalCredits,
      icon: Award,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      subLabel: `${totalSemesters} semesters`
    },
    {
      label: 'Avg Attendance',
      value: `${avgAttendance}%`,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      subLabel: `${validAttendance.length} subjects`
    },
    {
      label: 'Avg Marks',
      value: `${avgMarks}%`,
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      subLabel: `${validMarks.length} exams`
    },
    {
      label: 'Excellent Grades',
      value: excellentGrades,
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      subLabel: gradedSubjects > 0 ? `${Math.round((excellentGrades / gradedSubjects) * 100)}% of total` : '0%'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 sm:hover:scale-105 group"
          >
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                <div className={`p-2 sm:p-2.5 lg:p-3 rounded-xl ${stat.bgColor} sm:group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
                <div className="w-full">
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-foreground sm:group-hover:text-academic-primary transition-colors break-words">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 line-clamp-1">
                    {stat.label}
                  </p>
                  {stat.subLabel && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5 sm:mt-1 line-clamp-1">
                      {stat.subLabel}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

