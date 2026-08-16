import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle, Database, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AttendanceRecord, MarksRecord, Semester, Subject } from '@/services/academicService';
import { auditAcademicDataHealth, type AcademicHealthIssue } from '@/domain/academicDataHealth';

interface AcademicDataHealthPanelProps {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
  compact?: boolean;
}

function getSeverityBadge(issue: AcademicHealthIssue) {
  if (issue.severity === 'critical') {
    return <Badge variant="destructive">Critical</Badge>;
  }

  if (issue.severity === 'warning') {
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
  }

  return <Badge variant="secondary">Info</Badge>;
}

export function AcademicDataHealthPanel({
  semesters,
  subjects,
  attendance,
  marks,
  compact = false,
}: AcademicDataHealthPanelProps) {
  const health = auditAcademicDataHealth({ semesters, subjects, attendance, marks });
  const visibleIssues = health.issues.slice(0, compact ? 4 : 8);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            {health.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-academic-success" />
            ) : health.status === 'critical' ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-academic-warning" />
            )}
            Academic Data Health
          </span>
          <span className="flex flex-wrap gap-2">
            <Badge variant={health.criticalCount > 0 ? 'destructive' : 'outline'}>
              {health.criticalCount} critical
            </Badge>
            <Badge variant="outline">{health.warningCount} warnings</Badge>
            <Badge variant="secondary">{health.infoCount} info</Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {health.issues.length === 0 ? (
          <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">No data quality issues detected.</p>
                <p className="text-sm opacity-80">Semesters, subjects, attendance, and marks look internally consistent.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleIssues.map((issue) => (
              <div key={issue.id} className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{issue.title}</p>
                      {getSeverityBadge(issue)}
                      <Badge variant="outline">{issue.count}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to={issue.route}>
                    Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}

            {health.issues.length > visibleIssues.length && (
              <p className="text-sm text-muted-foreground">
                {health.issues.length - visibleIssues.length} additional issue group(s) are hidden in compact view.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
