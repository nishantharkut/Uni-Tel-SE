import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Semester, Subject, AttendanceRecord, MarksRecord } from '@/services/academicService';
import { computeCGPA } from '@/utils/gradeCalculations';

interface AnalyticsInsightsProps {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
  currentCGPA: number | null;
}

export function AnalyticsInsights({
  semesters,
  subjects,
  attendance,
  marks,
  currentCGPA
}: AnalyticsInsightsProps) {
  // Calculate insights
  const insights: Array<{
    type: 'success' | 'warning' | 'info' | 'achievement';
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
  }> = [];

  // CGPA Insights
  if (currentCGPA !== null) {
    if (currentCGPA >= 9.0) {
      insights.push({
        type: 'achievement',
        icon: <Award className="w-4 h-4" />,
        title: 'Outstanding Performance!',
        description: `Your CGPA of ${currentCGPA.toFixed(2)} is exceptional. Keep up the excellent work!`,
        badge: 'Top Performer'
      });
    } else if (currentCGPA >= 8.0) {
      insights.push({
        type: 'success',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Great Performance',
        description: `Your CGPA of ${currentCGPA.toFixed(2)} shows strong academic performance.`,
        badge: 'Excellent'
      });
    } else if (currentCGPA >= 7.0) {
      insights.push({
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: 'Good Progress',
        description: `Your CGPA of ${currentCGPA.toFixed(2)} is good. Aim for 8.0+ to improve further.`,
        badge: 'On Track'
      });
    } else if (currentCGPA < 6.0) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Needs Improvement',
        description: `Your CGPA of ${currentCGPA.toFixed(2)} needs attention. Focus on improving grades.`,
        badge: 'Action Needed'
      });
    }
  }

  // Attendance Insights
  const validAttendance = attendance.filter(att => att.total_classes > 0);
  if (validAttendance.length > 0) {
    const avgAttendance = validAttendance.reduce((sum, att) => {
      const pct = (att.attended_classes / att.total_classes) * 100;
      return sum + pct;
    }, 0) / validAttendance.length;

    const lowAttendance = validAttendance.filter(att => {
      const pct = (att.attended_classes / att.total_classes) * 100;
      return pct < 75;
    });

    if (avgAttendance >= 90) {
      insights.push({
        type: 'achievement',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Excellent Attendance',
        description: `Your average attendance of ${Math.round(avgAttendance)}% is outstanding!`,
        badge: 'Perfect'
      });
    } else if (lowAttendance.length > 0) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Low Attendance Alert',
        description: `${lowAttendance.length} subject${lowAttendance.length > 1 ? 's' : ''} have attendance below 75%.`,
        badge: 'Attention'
      });
    }
  }

  // Grade Distribution Insights
  const gradedSubjects = subjects.filter(s => s.grade);
  if (gradedSubjects.length > 0) {
    const excellentGrades = gradedSubjects.filter(s => {
      const grade = s.grade!;
      return ['S', 'A+', 'A'].includes(grade);
    }).length;
    const excellentPercentage = (excellentGrades / gradedSubjects.length) * 100;

    if (excellentPercentage >= 70) {
      insights.push({
        type: 'achievement',
        icon: <Sparkles className="w-4 h-4" />,
        title: 'Excellent Grades',
        description: `${Math.round(excellentPercentage)}% of your subjects have excellent grades (A or above).`,
        badge: 'Outstanding'
      });
    }

    const backlogs = gradedSubjects.filter(s => {
      const grade = s.grade!;
      return ['D', 'F', 'I'].includes(grade);
    }).length;

    if (backlogs === 0 && gradedSubjects.length >= 3) {
      insights.push({
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'No Backlogs!',
        description: 'Congratulations! You have cleared all subjects with passing grades.',
        badge: 'Clear'
      });
    }
  }

  // Semester Trend Insights
  const semestersWithSGPA = semesters.filter(s => s.sgpa !== null).sort((a, b) => a.number - b.number);
  if (semestersWithSGPA.length >= 2) {
    const recent = semestersWithSGPA.slice(-2);
    const improvement = (recent[1].sgpa || 0) - (recent[0].sgpa || 0);

    if (improvement > 0.5) {
      insights.push({
        type: 'success',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Significant Improvement',
        description: `Your SGPA improved by ${improvement.toFixed(2)} points in the last semester!`,
        badge: 'Rising'
      });
    } else if (improvement < -0.5) {
      insights.push({
        type: 'warning',
        icon: <TrendingDown className="w-4 h-4" />,
        title: 'Performance Decline',
        description: `Your SGPA decreased by ${Math.abs(improvement).toFixed(2)} points. Focus on improvement.`,
        badge: 'Declining'
      });
    }
  }

  // Marks Performance Insights
  const validMarks = marks.filter(m => m.total_marks > 0);
  if (validMarks.length > 0) {
    const avgMarksPercentage = validMarks.reduce((sum, m) => {
      const pct = (m.obtained_marks / m.total_marks) * 100;
      return sum + pct;
    }, 0) / validMarks.length;

    if (avgMarksPercentage >= 90) {
      insights.push({
        type: 'achievement',
        icon: <Award className="w-4 h-4" />,
        title: 'Excellent Exam Scores',
        description: `Your average exam score is ${Math.round(avgMarksPercentage)}%. Outstanding performance!`,
        badge: 'Top Scores'
      });
    }
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {insights.slice(0, 6).map((insight, index) => (
        <Card
          key={index}
          className={cn(
            "border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden sm:hover:scale-[1.02]",
            insight.type === 'achievement' && "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900",
            insight.type === 'success' && "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900",
            insight.type === 'warning' && "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900",
            insight.type === 'info' && "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-900"
          )}
        >
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                insight.type === 'achievement' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                insight.type === 'success' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                insight.type === 'warning' && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
                insight.type === 'info' && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
              )}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5">
                  <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground line-clamp-2 sm:line-clamp-none">
                    {insight.title}
                  </h4>
                  {insight.badge && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] sm:text-xs flex-shrink-0 w-fit",
                        insight.type === 'achievement' && "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400",
                        insight.type === 'success' && "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400",
                        insight.type === 'warning' && "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400",
                        insight.type === 'info' && "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400"
                      )}
                    >
                      {insight.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {insight.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

