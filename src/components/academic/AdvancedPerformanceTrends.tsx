import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, Target, Sparkles } from 'lucide-react';
import { useSemesters, useSubjects } from '@/hooks/useAcademic';
import { computeCGPA } from '@/utils/gradeCalculations';
import { cn } from '@/lib/utils';

interface AdvancedPerformanceTrendsProps {
  showPrediction?: boolean;
  targetCGPA?: number;
}

export function AdvancedPerformanceTrends({ 
  showPrediction = true, 
  targetCGPA 
}: AdvancedPerformanceTrendsProps) {
  const { data: semesters = [] } = useSemesters();
  const { data: subjects = [] } = useSubjects();

  // Calculate CGPA trend with prediction
  const trendData = semesters
    .filter(sem => sem.sgpa !== null)
    .map((semester, index) => {
      // Get all subjects from semesters up to and including current semester
      const semestersUpToNow = semesters.slice(0, index + 1);
      const semesterIds = semestersUpToNow.map(s => s.id);
      const subjectsUpToNow = subjects.filter(sub => semesterIds.includes(sub.semester_id));
      
      return {
        semester: `Sem ${semester.number}`,
        sgpa: semester.sgpa || 0,
        cgpa: computeCGPA(subjectsUpToNow),
        credits: semester.total_credits || 0
      };
    })
    .sort((a, b) => parseInt(a.semester.split(' ')[1]) - parseInt(b.semester.split(' ')[1]));

  // Calculate prediction for next semester
  const calculatePrediction = () => {
    if (trendData.length < 2) return null;

    // Simple linear regression for prediction
    const n = trendData.length;
    const sumX = trendData.reduce((sum, _, i) => sum + (i + 1), 0);
    const sumY = trendData.reduce((sum, d) => sum + d.cgpa, 0);
    const sumXY = trendData.reduce((sum, d, i) => sum + (i + 1) * d.cgpa, 0);
    const sumX2 = trendData.reduce((sum, _, i) => sum + Math.pow(i + 1, 2), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - Math.pow(sumX, 2));
    const intercept = (sumY - slope * sumX) / n;

    // Predict next semester
    const nextSemesterNumber = trendData.length + 1;
    const predictedCGPA = slope * nextSemesterNumber + intercept;

    return {
      semester: `Sem ${nextSemesterNumber}`,
      cgpa: Math.max(0, Math.min(10, predictedCGPA)), // Clamp between 0 and 10
      isPrediction: true
    };
  };

  const prediction = showPrediction ? calculatePrediction() : null;
  const chartData = prediction 
    ? [...trendData, prediction]
    : trendData;

  // Calculate trend direction
  const getTrendDirection = () => {
    if (trendData.length < 2) return 'stable';
    const recent = trendData.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + d.cgpa, 0) / recent.length;
    const avgPrevious = trendData.length > 3
      ? trendData.slice(-6, -3).reduce((sum, d) => sum + d.cgpa, 0) / 3
      : trendData[0]?.cgpa || 0;
    
    if (avgRecent > avgPrevious + 0.1) return 'improving';
    if (avgRecent < avgPrevious - 0.1) return 'declining';
    return 'stable';
  };

  const trendDirection = getTrendDirection();

  if (trendData.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl color-primary-light">
              <TrendingUp className="w-5 h-5 text-academic-primary" />
            </div>
            Advanced Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground">No performance data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <div className="p-2 rounded-xl color-primary-light">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-academic-primary" />
            </div>
            <span>Advanced Performance Trends</span>
            {prediction && (
              <div className="flex items-center gap-1 ml-1 sm:ml-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-academic-accent" />
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">with Prediction</span>
              </div>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 sm:px-3 py-1 rounded-full text-xs font-medium",
              trendDirection === 'improving' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              trendDirection === 'declining' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              trendDirection === 'stable' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            )}>
              {trendDirection === 'improving' && '↗ Improving'}
              {trendDirection === 'declining' && '↘ Declining'}
              {trendDirection === 'stable' && '→ Stable'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* CGPA Trend with Prediction */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              CGPA Trend {prediction && '(with Prediction)'}
            </h4>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                <XAxis 
                  dataKey="semester" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 10]} 
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
                    if (props.payload.isPrediction) {
                      return [`${value.toFixed(2)} (Predicted)`, name];
                    }
                    return [value.toFixed(2), name];
                  }}
                />
                <Legend />
                {targetCGPA && (
                  <ReferenceLine 
                    y={targetCGPA} 
                    stroke="hsl(var(--academic-warning))" 
                    strokeDasharray="5 5"
                    label={{ value: `Target: ${targetCGPA}`, position: 'right' }}
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="cgpa" 
                  stroke="hsl(var(--academic-primary))" 
                  strokeWidth={3}
                  name="CGPA"
                  dot={(props: any) => {
                    if (props.payload.isPrediction) {
                      return <circle cx={props.cx} cy={props.cy} r={5} fill="hsl(var(--academic-accent))" stroke="hsl(var(--academic-accent))" strokeWidth={2} />;
                    }
                    return <circle cx={props.cx} cy={props.cy} r={4} fill="hsl(var(--academic-primary))" strokeWidth={2} />;
                  }}
                  strokeDasharray={prediction ? undefined : undefined}
                />
                {prediction && (
                  <Line 
                    type="monotone" 
                    dataKey="cgpa" 
                    stroke="hsl(var(--academic-accent))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted CGPA"
                    data={[trendData[trendData.length - 1], prediction]}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          {trendData.length >= 2 && (
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-2">
              <h5 className="font-medium text-xs sm:text-sm flex items-center gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-academic-accent" />
                Performance Insights
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Current CGPA</p>
                  <p className="font-semibold text-lg">
                    {trendData[trendData.length - 1]?.cgpa.toFixed(2) || 'N/A'}
                  </p>
                </div>
                {prediction && (
                  <div>
                    <p className="text-muted-foreground">Predicted Next CGPA</p>
                    <p className="font-semibold text-lg text-academic-accent">
                      {prediction.cgpa.toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Best Semester</p>
                  <p className="font-semibold text-lg">
                    {trendData.reduce((best, current) => 
                      current.cgpa > best.cgpa ? current : best
                    )?.semester || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

