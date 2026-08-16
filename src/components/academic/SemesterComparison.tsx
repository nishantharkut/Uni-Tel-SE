import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Semester } from '@/services/academicService';
import { cn } from '@/lib/utils';

interface SemesterComparisonProps {
  semesters: Semester[];
}

export function SemesterComparison({ semesters }: SemesterComparisonProps) {
  const semestersWithSGPA = semesters
    .filter(sem => sem.sgpa !== null)
    .map(sem => ({
      semester: `Sem ${sem.number}`,
      sgpa: sem.sgpa || 0,
      credits: sem.total_credits || 0
    }))
    .sort((a, b) => parseInt(a.semester.split(' ')[1]) - parseInt(b.semester.split(' ')[1]));

  if (semestersWithSGPA.length < 2) {
    return null; // Don't show comparison if less than 2 semesters
  }

  // Calculate improvement/decline
  const comparisonData = semestersWithSGPA.map((sem, index) => {
    const previous = index > 0 ? semestersWithSGPA[index - 1] : null;
    const change = previous ? sem.sgpa - previous.sgpa : 0;
    const changePercent = previous && previous.sgpa > 0 
      ? ((change / previous.sgpa) * 100).toFixed(1)
      : '0.0';

    return {
      ...sem,
      change,
      changePercent: parseFloat(changePercent),
      trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable'
    };
  });

  const getBarColor = (trend: string) => {
    if (trend === 'up') return 'hsl(var(--academic-primary))';
    if (trend === 'down') return 'hsl(var(--academic-danger))';
    return 'hsl(var(--academic-accent))';
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="p-2 rounded-xl color-primary-light">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-academic-primary" />
          </div>
          Semester Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Comparison Chart */}
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
              <XAxis 
                dataKey="semester" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'sgpa') {
                    return [
                      `${value.toFixed(2)} ${props.payload.change !== 0 ? `(${props.payload.change > 0 ? '+' : ''}${props.payload.change.toFixed(2)})` : ''}`,
                      'SGPA'
                    ];
                  }
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey="sgpa" 
                name="SGPA"
                radius={[4, 4, 0, 0]}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Trend Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {comparisonData.slice(1).map((sem, index) => {
              const Icon = sem.trend === 'up' ? TrendingUp : sem.trend === 'down' ? TrendingDown : Minus;
              return (
                <div
                  key={index}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-lg border",
                    sem.trend === 'up' && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    sem.trend === 'down' && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                    sem.trend === 'stable' && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{sem.semester}</p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-0.5">
                        {sem.sgpa.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={cn(
                        "flex items-center gap-1 text-xs sm:text-sm font-semibold",
                        sem.trend === 'up' && "text-green-700 dark:text-green-400",
                        sem.trend === 'down' && "text-red-700 dark:text-red-400",
                        sem.trend === 'stable' && "text-blue-700 dark:text-blue-400"
                      )}>
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{sem.change > 0 ? '+' : ''}{sem.change.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                        {sem.changePercent > 0 ? '+' : ''}{sem.changePercent}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

