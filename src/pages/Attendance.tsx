
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar, 
  TrendingUp, 
  UserX, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';
import { useAttendance, useSemesters } from '@/hooks/useAcademic';
import { LazyActiveAttendanceCard } from '@/components/academic/LazyActiveAttendanceCard';
import { PageLoader } from '@/components/ui/PageLoader';

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const { data: attendance = [], isLoading } = useAttendance();
  const { data: semesters = [] } = useSemesters();

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.subject_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || record.semester_id === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  // Calculate stats
  const totalRecords = attendance.length;
  const averageAttendance = attendance.length > 0 
    ? Math.round(attendance.reduce((sum, record) => 
        sum + (record.total_classes > 0 ? (record.attended_classes / record.total_classes * 100) : 0), 0
      ) / attendance.length)
    : 0;
  const criticalSubjects = attendance.filter(record => 
    record.total_classes > 0 && (record.attended_classes / record.total_classes * 100) < 75
  ).length;

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading attendance records" 
        subMessage="Fetching your attendance data..."
        variant="default"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl space-y-6 sm:space-y-8">
        
        {/* Hero Section - Attendance */}
        <div className="relative overflow-hidden rounded-3xl color-accent p-6 sm:p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                      Attendance Tracker
                    </h1>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Mark attendance and track your progress
                    </p>
                  </div>
                </div>
                
                {averageAttendance > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Average Attendance</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{averageAttendance}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="color-primary border-0 px-4 py-2 text-sm font-semibold">
                        <Activity className="w-4 h-4 mr-2" />
                        {totalRecords} Subject{totalRecords !== 1 ? 's' : ''}
                      </Badge>
                      {criticalSubjects > 0 && (
                        <Badge className="color-danger border-0 px-4 py-2 text-sm font-semibold">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          {criticalSubjects} Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Subjects Card */}
          <Card className="group relative overflow-hidden border-0 color-primary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-primary-light group-hover:bg-academic-primary/20 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-academic-primary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-primary">
                    {totalRecords}
                  </div>
                  <p className="text-sm font-medium text-academic-primary/80">Total Subjects</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-primary/70">Active</span>
                  <span className="font-semibold text-academic-primary">
                    {totalRecords > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <Progress 
                  value={totalRecords > 0 ? 100 : 0} 
                  className="h-2 bg-academic-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Average Attendance Card */}
          <Card className="group relative overflow-hidden border-0 color-secondary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-secondary-light group-hover:bg-academic-secondary/20 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {averageAttendance}%
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">Avg Attendance</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Performance</span>
                  <span className="font-semibold text-academic-secondary">
                    {averageAttendance >= 75 ? 'Good' : averageAttendance >= 60 ? 'Average' : 'Poor'}
                  </span>
                </div>
                <Progress 
                  value={averageAttendance} 
                  className="h-2 bg-academic-secondary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Critical Subjects Card */}
          <Card className="group relative overflow-hidden border-0 color-danger-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-danger-light group-hover:bg-academic-danger/20 transition-colors duration-300">
                  <AlertTriangle className="h-6 w-6 text-academic-danger" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-danger">
                    {criticalSubjects}
                  </div>
                  <p className="text-sm font-medium text-academic-danger/80">Critical Subjects</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-danger/70">Status</span>
                  <span className="font-semibold text-academic-danger">
                    {criticalSubjects === 0 ? 'All Good' : 'Needs Attention'}
                  </span>
                </div>
                <Progress 
                  value={criticalSubjects === 0 ? 100 : 0} 
                  className="h-2 bg-academic-danger/20"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-academic-primary transition-colors"
                  />
                </div>
              </div>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-2 focus:border-academic-primary transition-colors">
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Active Attendance Tracking */}
        <LazyActiveAttendanceCard records={filteredAttendance} />
      </div>
    </div>
  );
}
