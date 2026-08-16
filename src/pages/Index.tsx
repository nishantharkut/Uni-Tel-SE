
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  Award,
  BarChart3,
  Plus,
  ArrowRight,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Activity,
  Sparkles,
  GraduationCap,
  TrendingDown,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { useAcademicSummary } from '@/hooks/useAcademicSummary';
import { LazyPerformanceTrends } from '@/components/academic/LazyPerformanceTrends';
import { Link } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';

export default function Index() {
  const { data: summary, isLoading } = useAcademicSummary();

  if (isLoading) {
    return (
      <PageLoader 
        message="Loading your academic dashboard" 
        subMessage="Fetching your academic data..."
        variant="default"
      />
    );
  }

  // Helper functions for responsive design
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPerformanceStatus = (cgpa: number) => {
    if (cgpa >= 8.5) return { status: "Excellent", color: "text-academic-success", bgColor: "color-accent-light", icon: Star };
    if (cgpa >= 7.0) return { status: "Good", color: "text-academic-primary", bgColor: "color-primary-light", icon: CheckCircle };
    if (cgpa >= 6.0) return { status: "Average", color: "text-academic-warning", bgColor: "color-warning-light", icon: AlertCircle };
    return { status: "Needs Improvement", color: "text-academic-danger", bgColor: "color-danger-light", icon: AlertCircle };
  };

  const performanceStatus = summary?.cgpa ? getPerformanceStatus(summary.cgpa) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl space-y-6 sm:space-y-8">
        
        {/* Hero Section - Mobile First */}
        <div className="relative overflow-hidden rounded-3xl color-primary p-6 sm:p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                      {getGreeting()}!
                    </h1>
                     <p className="text-white/80 text-sm sm:text-base">
                       Welcome to your academic dashboard
                     </p>
                  </div>
                </div>
                
                {summary?.cgpa && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <Award className="w-5 h-5" />
                      </div>
                       <div>
                         <p className="text-sm text-white/80">Current CGPA</p>
                         <p className="text-2xl sm:text-3xl font-bold">{summary.cgpa.toFixed(2)}</p>
                       </div>
                    </div>
                    {performanceStatus && (
                      <Badge className={`${performanceStatus.bgColor} ${performanceStatus.color} border-0 px-4 py-2 text-sm font-semibold`}>
                        <performanceStatus.icon className="w-4 h-4 mr-2" />
                        {performanceStatus.status}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                <Link to="/semesters" className="block">
                   <Button size="lg" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm font-semibold h-12 sm:h-14 px-6 sm:px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Quick Start</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </Link>
                <Link to="/analytics" className="block">
                   <Button size="lg" className="w-full sm:w-auto color-accent text-white hover:bg-academic-accent/90 backdrop-blur-sm font-semibold h-12 sm:h-14 px-6 sm:px-8">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">View Analytics</span>
                    <span className="sm:hidden">Analytics</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Semesters Card */}
          <Card className="group relative overflow-hidden border-0 color-primary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-primary-light group-hover:bg-academic-primary/20 transition-colors duration-300">
                  <Calendar className="h-6 w-6 text-academic-primary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-primary">
                    {summary?.total_semesters || 0}
                  </div>
                  <p className="text-sm font-medium text-academic-primary/80">Semesters</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-primary/70">Academic Progress</span>
                  <span className="font-semibold text-academic-primary">
                    {summary?.total_semesters ? Math.round(Math.min((summary.total_semesters / 8) * 100, 100)) : 0}%
                  </span>
                </div>
                <Progress 
                  value={summary?.total_semesters ? Math.round(Math.min((summary.total_semesters / 8) * 100, 100)) : 0} 
                  className="h-2 bg-academic-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects Card */}
          <Card className="group relative overflow-hidden border-0 color-secondary-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-secondary-light group-hover:bg-academic-secondary/20 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {summary?.total_subjects || 0}
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">Subjects</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Course Load</span>
                  <span className="font-semibold text-academic-secondary">
                    {summary?.total_subjects ? Math.round(Math.min((summary.total_subjects / 40) * 100, 100)) : 0}%
                  </span>
                </div>
                <Progress 
                  value={summary?.total_subjects ? Math.round(Math.min((summary.total_subjects / 40) * 100, 100)) : 0} 
                  className="h-2 bg-academic-secondary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* CGPA Card */}
          <Card className="group relative overflow-hidden border-0 color-accent-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-accent-light group-hover:bg-academic-accent/40 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {summary?.cgpa ? summary.cgpa.toFixed(2) : 'N/A'}
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">CGPA</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Performance</span>
                  <span className="font-semibold text-academic-secondary">
                    {summary?.cgpa ? Math.round(Math.min((summary.cgpa / 10) * 100, 100)) : 0}%
                  </span>
                </div>
                <Progress 
                  value={summary?.cgpa ? Math.round(Math.min((summary.cgpa / 10) * 100, 100)) : 0} 
                  className="h-2 bg-academic-accent/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="group relative overflow-hidden border-0 color-warning-light hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-academic-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl color-warning-light group-hover:bg-academic-warning/40 transition-colors duration-300">
                  <Award className="h-6 w-6 text-academic-secondary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-academic-secondary">
                    {summary?.total_credits || 0}
                  </div>
                  <p className="text-sm font-medium text-academic-secondary/80">Credits</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-academic-secondary/70">Credit Progress</span>
                  <span className="font-semibold text-academic-secondary">
                    {summary?.total_credits ? Math.min((summary.total_credits / 160) * 100, 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={summary?.total_credits ? Math.min((summary.total_credits / 160) * 100, 100) : 0} 
                  className="h-2 bg-academic-warning/30"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Quick Actions - Enhanced */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/semesters" className="block group">
                  <Button variant="outline" className="w-full justify-between h-14 border-2 border-academic-primary/30 hover:border-academic-primary/50 hover:bg-academic-primary/10 transition-all duration-200 group-hover:shadow-md">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg color-primary-light group-hover:bg-academic-primary/20 transition-colors">
                         <Calendar className="w-5 h-5 text-academic-primary" />
                       </div>
                       <span className="font-medium text-academic-primary">Manage Semesters</span>
                     </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-academic-primary" />
                  </Button>
                </Link>
                
                <Link to="/attendance" className="block group">
                  <Button variant="outline" className="w-full justify-between h-14 border-2 border-academic-secondary/30 hover:border-academic-secondary/50 hover:bg-academic-secondary/10 transition-all duration-200 group-hover:shadow-md">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg color-secondary-light group-hover:bg-academic-secondary/20 transition-colors">
                         <Clock className="w-5 h-5 text-academic-secondary" />
                       </div>
                       <span className="font-medium text-academic-secondary">Track Attendance</span>
                     </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-academic-secondary" />
                  </Button>
                </Link>
                
                <Link to="/marks" className="block group">
                  <Button variant="outline" className="w-full justify-between h-14 border-2 border-academic-warning/30 hover:border-academic-warning/50 hover:bg-academic-warning/10 transition-all duration-200 group-hover:shadow-md">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg color-warning-light group-hover:bg-academic-warning/40 transition-colors">
                         <BarChart3 className="w-5 h-5 text-academic-secondary" />
                       </div>
                       <span className="font-medium text-academic-secondary">Manage Marks</span>
                     </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-academic-secondary" />
                  </Button>
                </Link>
                
                <Link to="/analytics" className="block group">
                  <Button variant="outline" className="w-full justify-between h-14 border-2 border-academic-accent/30 hover:border-academic-accent/50 hover:bg-academic-accent/10 transition-all duration-200 group-hover:shadow-md">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg color-accent-light group-hover:bg-academic-accent/40 transition-colors">
                         <TrendingUp className="w-5 h-5 text-academic-secondary" />
                       </div>
                       <span className="font-medium text-academic-secondary">View Analytics</span>
                     </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-academic-secondary" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                 <CardTitle className="flex items-center gap-3 text-xl">
                   <div className="p-2 rounded-xl color-primary-light">
                     <Activity className="w-5 h-5 text-academic-primary" />
                   </div>
                   Recent Activity
                 </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.total_semesters > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl color-primary-light border border-academic-primary/20">
                      <div className="p-2 rounded-lg color-primary-light">
                        <CheckCircle className="w-4 h-4 text-academic-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-academic-primary">Academic Progress</p>
                        <p className="text-xs text-academic-primary/80">Keep up the great work!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl color-secondary-light border border-academic-secondary/20">
                      <div className="p-2 rounded-lg color-secondary-light">
                        <BookOpen className="w-4 h-4 text-academic-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-academic-secondary">Subjects Enrolled</p>
                        <p className="text-xs text-academic-secondary/80">{summary.total_subjects} courses active</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Start your academic journey</p>
                    <Link to="/semesters">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Semester
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview - Enhanced */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                 <CardTitle className="flex items-center gap-3 text-xl">
                   <div className="p-2 rounded-xl color-accent-light">
                     <BarChart3 className="w-5 h-5 text-academic-secondary" />
                   </div>
                   Academic Performance
                 </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.total_semesters > 0 ? (
                  <LazyPerformanceTrends />
                ) : (
                  <div className="text-center py-12 lg:py-16">
                    <div className="relative mb-8">
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 w-24 h-24 mx-auto flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                        <BookOpen className="w-12 h-12 text-muted-foreground/60" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary/60" />
                      </div>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">Start Your Academic Journey</h3>
                    <p className="text-muted-foreground mb-8 text-sm lg:text-base leading-relaxed max-w-md mx-auto">
                      Add your first semester and subjects to unlock powerful analytics and track your academic progress.
                    </p>
                    <Link to="/semesters">
                      <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="w-5 h-5 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievement & Insights Section */}
            {summary?.total_semesters > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Achievement Card */}
                 <Card className="border-0 shadow-lg color-warning-light">
                   <CardHeader className="pb-4">
                     <CardTitle className="flex items-center gap-3 text-lg">
                       <div className="p-2 rounded-xl color-warning-light">
                         <Star className="w-5 h-5 text-academic-secondary" />
                       </div>
                       Achievements
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-academic-warning/20">
                       <div className="p-2 rounded-lg color-warning-light">
                         <GraduationCap className="w-4 h-4 text-academic-secondary" />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-academic-secondary">Academic Milestone</p>
                         <p className="text-xs text-academic-secondary/80">{summary.total_semesters} semesters completed</p>
                       </div>
                     </div>
                     {summary.cgpa && summary.cgpa >= 8.0 && (
                       <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-academic-warning/20">
                         <div className="p-2 rounded-lg color-warning-light">
                           <Award className="w-4 h-4 text-academic-secondary" />
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-academic-secondary">Excellent Performance</p>
                           <p className="text-xs text-academic-secondary/80">CGPA above 8.0</p>
                         </div>
                       </div>
                     )}
                   </CardContent>
                 </Card>

                 {/* Insights Card */}
                 <Card className="border-0 shadow-lg color-accent-light">
                   <CardHeader className="pb-4">
                     <CardTitle className="flex items-center gap-3 text-lg">
                       <div className="p-2 rounded-xl color-accent-light">
                         <TrendingUpIcon className="w-5 h-5 text-academic-secondary" />
                       </div>
                       Quick Insights
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-academic-accent/20">
                       <div className="p-2 rounded-lg color-accent-light">
                         <BookOpen className="w-4 h-4 text-academic-secondary" />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-academic-secondary">Course Load</p>
                         <p className="text-xs text-academic-secondary/80">{summary.total_subjects} subjects enrolled</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-academic-accent/20">
                       <div className="p-2 rounded-lg color-accent-light">
                         <Award className="w-4 h-4 text-academic-secondary" />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-academic-secondary">Credit Progress</p>
                         <p className="text-xs text-academic-secondary/80">{summary.total_credits} credits earned</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
