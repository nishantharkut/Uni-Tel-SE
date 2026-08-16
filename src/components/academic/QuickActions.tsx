
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Calendar, FileText, BarChart3 } from 'lucide-react';
import { ImportExport } from './ImportExport';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add Semester',
      description: 'Create a new academic semester',
      icon: Plus,
      onClick: () => navigate('/semesters'),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'View Subjects',
      description: 'Manage subjects and grades',
      icon: BookOpen,
      onClick: () => navigate('/semesters'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Track Attendance',
      description: 'Monitor class attendance',
      icon: Calendar,
      onClick: () => navigate('/semesters'),
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    },
    {
      title: 'Record Marks',
      description: 'Add exam and test scores',
      icon: FileText,
      onClick: () => navigate('/semesters'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <ImportExport />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 justify-start ${action.color}`}
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
