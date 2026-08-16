
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, Award, BookOpen } from 'lucide-react';
import { useSemesters, useSubjects, useAttendance, useAcademicSummary } from '@/hooks/useAcademic';

export function AnalyticsPanel() {
  const { data: semesters = [] } = useSemesters();
  const { data: subjects = [] } = useSubjects();
  const { data: attendance = [] } = useAttendance();
  const { data: academicSummary } = useAcademicSummary();

  // Prepare CGPA trend data
  const cgpaTrendData = semesters
    .filter(sem => sem.sgpa !== null)
    .map(sem => ({
      semester: `Sem ${sem.number}`,
      sgpa: sem.sgpa
    }));

  // Prepare grade distribution data
  const gradeDistribution = subjects.reduce((acc: any, subject: any) => {
    if (subject.grade) {
      acc[subject.grade] = (acc[subject.grade] || 0) + 1;
    }
    return acc;
  }, {});

  const gradeDistributionData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    grade,
    count
  }));

  // Get low attendance subjects (below 75%)
  const lowAttendanceSubjects = attendance.filter((record: any) => 
    record.percentage && record.percentage < 75
  );

  // Calculate average attendance
  const avgAttendance = attendance.length > 0 
    ? attendance.reduce((sum: number, record: any) => sum + (record.percentage || 0), 0) / attendance.length
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* CGPA Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            CGPA Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cgpaTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cgpaTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sgpa" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No SGPA data available yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gradeDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No grades available yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {avgAttendance.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Average Attendance</p>
            </div>

            {lowAttendanceSubjects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Low Attendance</span>
                </div>
                <div className="space-y-1">
                  {lowAttendanceSubjects.slice(0, 5).map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{record.subject_name}</span>
                      <Badge variant="outline" className="text-amber-600">
                        {record.percentage != null ? `${record.percentage.toFixed(1)}%` : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                  {lowAttendanceSubjects.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{lowAttendanceSubjects.length - 5} more subjects
                    </p>
                  )}
                </div>
              </div>
            )}

            {lowAttendanceSubjects.length === 0 && attendance.length > 0 && (
              <div className="text-center text-green-600">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Good Attendance!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  All subjects above 75%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Overview Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Current CGPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center">
            {academicSummary?.cgpa?.toFixed(2) || 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Overall Performance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center">
            {academicSummary?.total_credits || 0}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Credits Completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backlogs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              (academicSummary?.backlogs || 0) === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {academicSummary?.backlogs || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(academicSummary?.backlogs || 0) === 0 ? 'All Clear!' : 'Subjects to Clear'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
