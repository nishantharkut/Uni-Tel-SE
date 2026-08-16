import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useAttendance } from '@/hooks/useAcademic';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AttendanceHeatmapProps {
  month?: Date;
}

export function AttendanceHeatmap({ month = new Date() }: AttendanceHeatmapProps) {
  const { data: attendance = [] } = useAttendance();

  // Get all days in the month
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate attendance percentage for each day
  // For now, we'll use a simplified approach - you can enhance this with actual daily attendance data
  const getAttendanceForDay = (day: Date) => {
    // This is a placeholder - in a real implementation, you'd have daily attendance records
    // For now, we'll calculate based on subject attendance averages
    const dayOfWeek = day.getDay();
    const dayAttendance = attendance
      .filter(att => {
        // Filter by day of week (simplified - assumes classes on specific days)
        return true; // You can add logic to filter by actual class days
      })
      .reduce((sum, att) => {
        const percentage = att.total_classes > 0 
          ? (att.attended_classes / att.total_classes) * 100 
          : 0;
        return sum + percentage;
      }, 0);

    const avgAttendance = attendance.length > 0 ? dayAttendance / attendance.length : 0;
    return Math.round(avgAttendance);
  };

  const getColorIntensity = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    if (percentage > 0) return 'bg-red-500';
    return 'bg-muted';
  };

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add padding days from previous month
  const firstDayOfWeek = monthStart.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDay = new Date(monthStart);
    prevDay.setDate(prevDay.getDate() - (firstDayOfWeek - i));
    currentWeek.push(prevDay);
  }

  daysInMonth.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === daysInMonth.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Add padding days to last week
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    const nextDay = new Date(currentWeek[currentWeek.length - 1]);
    nextDay.setDate(nextDay.getDate() + 1);
    currentWeek.push(nextDay);
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, att) => {
        const percentage = att.total_classes > 0 
          ? (att.attended_classes / att.total_classes) * 100 
          : 0;
        return sum + percentage;
      }, 0) / attendance.length)
    : 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl color-primary-light">
            <Calendar className="w-5 h-5 text-academic-primary" />
          </div>
          Attendance Heatmap - {format(month, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendance.length > 0 ? (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="space-y-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIndex) => {
                      const isCurrentMonth = isSameMonth(day, month);
                      const isCurrentDay = isToday(day);
                      const attendancePercentage = isCurrentMonth ? getAttendanceForDay(day) : 0;

                      return (
                        <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer',
                                  isCurrentMonth
                                    ? getColorIntensity(attendancePercentage)
                                    : 'bg-muted/30',
                                  isCurrentDay && 'ring-2 ring-academic-primary ring-offset-2',
                                  !isCurrentMonth && 'opacity-30'
                                )}
                              >
                                {isCurrentMonth && (
                                  <span className={cn(
                                    'text-white font-semibold',
                                    attendancePercentage === 0 && 'text-muted-foreground'
                                  )}>
                                    {format(day, 'd')}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-semibold">{format(day, 'EEEE, MMMM d, yyyy')}</p>
                                {isCurrentMonth && (
                                  <p className="text-sm">
                                    Average Attendance: {attendancePercentage}%
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded bg-muted"></div>
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <div className="w-3 h-3 rounded bg-green-600"></div>
                </div>
                <span>More</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly Average: <span className="font-semibold text-foreground">{avgAttendance}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <p className="text-muted-foreground">No attendance data available</p>
        </div>
      )}
      </CardContent>
    </Card>
  );
}


