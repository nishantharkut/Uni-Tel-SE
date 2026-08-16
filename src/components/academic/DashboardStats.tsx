
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAcademicSummary } from '@/hooks/useAcademic';

export function DashboardStats() {
  const { data: summary, isLoading } = useAcademicSummary();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: 'CGPA',
      value: summary?.cgpa ? summary.cgpa.toFixed(2) : 'N/A',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Semesters',
      value: summary?.total_semesters?.toString() || '0',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Subjects',
      value: summary?.total_subjects?.toString() || '0',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Credits',
      value: summary?.total_credits?.toString() || '0',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Academic Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`p-3 rounded-lg ${stat.bgColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm font-medium text-gray-600">{stat.title}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        
        {summary && summary.backlogs > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-600">Backlogs</span>
              <Badge variant="destructive">{summary.backlogs}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
