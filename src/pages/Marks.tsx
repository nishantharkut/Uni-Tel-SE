
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Target, 
  TrendingUp,
  Award,
  Star,
  CheckCircle,
  Activity,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { useMarks, useSemesters } from '@/hooks/useAcademic';
import { LazyMarksEditor } from '@/components/academic/LazyMarksEditor';
import { PageLoader } from '@/components/ui/PageLoader';

export default function Marks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');

  const { data: marks = [], isLoading } = useMarks();
  const { data: semesters = [] } = useSemesters();

  const filteredMarks = marks.filter(record => {
    const matchesSearch = record.subject_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || record.semester_id === selectedSemester;
    const matchesExamType = selectedExamType === 'all' || record.exam_type === selectedExamType;
    return matchesSearch && matchesSemester && matchesExamType;
  });

  // Calculate stats
  const totalRecords = marks.length;
  // Filter out records with zero total_marks to avoid division by zero
  const validMarks = marks.filter(record => record.total_marks > 0);
  const averagePercentage = validMarks.length > 0 
    ? Math.round(validMarks.reduce((sum, record) => 
        sum + (record.obtained_marks / record.total_marks * 100), 0
      ) / validMarks.length)
    : 0;
  const excellentMarks = validMarks.filter(record => 
    (record.obtained_marks / record.total_marks * 100) >= 90
  ).length;

  // Get unique exam types
  const examTypes = [...new Set(marks.map(m => m.exam_type))];

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading marks records" 
        subMessage="Retrieving your exam results..."
        variant="default"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl space-y-6 sm:space-y-8">
        
        {/* Hero Section - Marks */}
        <div className="relative overflow-hidden rounded-3xl color-warning p-6 sm:p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                      Marks & Performance
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base">
                      Track exam scores with weightage system
                    </p>
                  </div>
                </div>
                
                {averagePercentage > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Average Score</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{averagePercentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="color-primary border-0 px-4 py-2 text-sm font-semibold">
                        <Activity className="w-4 h-4 mr-2" />
                        {totalRecords} Record{totalRecords !== 1 ? 's' : ''}
                      </Badge>
                      {excellentMarks > 0 && (
                        <Badge className="color-accent border-0 px-4 py-2 text-sm font-semibold">
                          <Star className="w-4 h-4 mr-2" />
                          {excellentMarks} Excellent
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Records Card */}
          <Card className="group relative overflow-hidden border-0 color-primary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="p-3 rounded-2xl color-primary-light group-hover:bg-academic-primary/20 transition-colors duration-300">
                  <FileText className="h-6 w-6 text-academic-primary" />
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-primary">
                    {totalRecords}
                  </div>
                  <p className="text-sm font-medium text-academic-primary/80">Total Records</p>
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

          {/* Average Score Card */}
          <Card className="group relative overflow-hidden border-0 color-secondary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="p-3 rounded-2xl color-secondary-light group-hover:bg-academic-secondary/20 transition-colors duration-300">
                  <Target className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {averagePercentage}%
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">Average Score</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Performance</span>
                  <span className="font-semibold text-academic-secondary">
                    {averagePercentage >= 90 ? 'Excellent' : averagePercentage >= 80 ? 'Good' : averagePercentage >= 70 ? 'Average' : 'Needs Improvement'}
                  </span>
                </div>
                <Progress 
                  value={averagePercentage} 
                  className="h-2 bg-academic-secondary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Excellent Scores Card */}
          <Card className="group relative overflow-hidden border-0 color-accent-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="p-3 rounded-2xl color-accent-light group-hover:bg-academic-accent/20 transition-colors duration-300">
                  <Star className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {excellentMarks}
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">Excellent Scores</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Achievement</span>
                  <span className="font-semibold text-academic-secondary">
                    {excellentMarks > 0 ? `${Math.round((excellentMarks / totalRecords) * 100)}%` : '0%'}
                  </span>
                </div>
                <Progress 
                  value={totalRecords > 0 ? (excellentMarks / totalRecords) * 100 : 0} 
                  className="h-2 bg-academic-accent/30"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus:border-academic-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="h-12 rounded-xl border-2 focus:border-academic-primary transition-colors">
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
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger className="h-12 rounded-xl border-2 focus:border-academic-primary transition-colors">
                    <SelectValue placeholder="All exam types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exam Types</SelectItem>
                    {examTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Editor with Custom Exam Types & Weightages */}
        <LazyMarksEditor />
      </div>
    </div>
  );
}
