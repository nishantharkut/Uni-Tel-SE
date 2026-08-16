
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl font-bold text-muted-foreground">404</div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for something specific?
            </p>
            <div className="flex gap-2 text-sm">
              <Button variant="ghost" size="sm" onClick={() => navigate('/semesters')}>
                Semesters
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>
                Attendance
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/marks')}>
                Marks
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
