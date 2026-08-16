import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingUp } from 'lucide-react';
import { useSubjects } from '@/hooks/useAcademic';
import { getGradeColor } from '@/utils/gradeCalculations';

export function GradeDistributionHistogram() {
  const { data: subjects = [] } = useSubjects();

  // Grade order (best to worst)
  const gradeOrder = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  // Calculate grade distribution
  const gradeDistribution = subjects
    .filter(sub => sub.grade)
    .reduce((acc, sub) => {
      const grade = sub.grade!;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Create data array with all grades (including zeros)
  const distributionData = gradeOrder.map(grade => ({
    grade,
    count: gradeDistribution[grade] || 0,
    percentage: subjects.filter(s => s.grade).length > 0
      ? Math.round(((gradeDistribution[grade] || 0) / subjects.filter(s => s.grade).length) * 100)
      : 0
  })).filter(item => item.count > 0 || gradeOrder.indexOf(item.grade) <= 5); // Show at least top grades

  // Calculate statistics
  const totalGraded = subjects.filter(s => s.grade).length;
  const excellentGrades = ['S', 'A+', 'A'].reduce((sum, grade) => sum + (gradeDistribution[grade] || 0), 0);
  const goodGrades = ['A-', 'B+', 'B'].reduce((sum, grade) => sum + (gradeDistribution[grade] || 0), 0);
  const averageGrades = ['B-', 'C+', 'C'].reduce((sum, grade) => sum + (gradeDistribution[grade] || 0), 0);
  const poorGrades = ['C-', 'D', 'F'].reduce((sum, grade) => sum + (gradeDistribution[grade] || 0), 0);

  const getBarColor = (grade: string) => {
    const color = getGradeColor(grade);
    // Extract color from className or use default
    if (color.includes('green')) return '#10b981';
    if (color.includes('blue')) return '#3b82f6';
    if (color.includes('yellow')) return '#eab308';
    if (color.includes('orange')) return '#f97316';
    if (color.includes('red')) return '#ef4444';
    return '#6b7280';
  };

  if (totalGraded === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl color-accent-light">
              <Award className="w-5 h-5 text-academic-secondary" />
            </div>
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground">No grade data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="p-2 rounded-xl color-accent-light">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-academic-secondary" />
          </div>
          Grade Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Histogram Chart */}
          <div>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                <XAxis 
                  dataKey="grade" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    return [
                      `${value} subjects (${props.payload.percentage}%)`,
                      'Count'
                    ];
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name="Number of Subjects"
                  radius={[4, 4, 0, 0]}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.grade)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">Excellent</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{excellentGrades}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {totalGraded > 0 ? Math.round((excellentGrades / totalGraded) * 100) : 0}% of total
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">Good</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{goodGrades}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {totalGraded > 0 ? Math.round((goodGrades / totalGraded) * 100) : 0}% of total
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200">Average</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{averageGrades}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {totalGraded > 0 ? Math.round((averageGrades / totalGraded) * 100) : 0}% of total
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Needs Improvement</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">{poorGrades}</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {totalGraded > 0 ? Math.round((poorGrades / totalGraded) * 100) : 0}% of total
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Graded Subjects</p>
                <p className="text-xl sm:text-2xl font-bold">{totalGraded}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Overall Performance</p>
                <p className="text-xl sm:text-2xl font-bold text-academic-primary">
                  {excellentGrades + goodGrades > 0 
                    ? Math.round(((excellentGrades + goodGrades) / totalGraded) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Excellent + Good</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

