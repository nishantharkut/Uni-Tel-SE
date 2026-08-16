import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, FileText } from 'lucide-react';

export function JsonImportGuide() {
  const sampleJson = {
    semesters: [
      {
        number: 1,
        subjects: [
          {
            name: 'Mathematics I',
            credits: 4,
            grade: 'A',
          },
          {
            name: 'Physics',
            credits: 3,
            grade: 'B',
          },
          {
            name: 'Chemistry',
            credits: 3,
            grade: 'A-',
          },
        ],
        attendance: [
          {
            subject_name: 'Mathematics I',
            total_classes: 28,
            attended_classes: 24,
            note: 'Includes approved leave',
          },
        ],
        marks: [
          {
            subject_name: 'Mathematics I',
            exam_type: 'Minor Examination',
            total_marks: 30,
            obtained_marks: 25,
            weightage: 30,
          },
        ],
      },
      {
        number: 2,
        subjects: [
          {
            name: 'Mathematics II',
            credits: 4,
            grade: 'A-',
          },
          {
            name: 'Computer Science',
            credits: 4,
            grade: 'A',
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">JSON Import Guide</h3>
        <p className="text-muted-foreground mb-4">
          Format semester, subject, attendance, and marks data before importing it into UNI-TEL.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              JSON Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                The JSON must contain a root <Badge variant="outline">semesters</Badge> array with semester objects.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Semester Object
                </h4>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li><Badge variant="outline">number</Badge> - Semester number from 1 to 12 (required)</li>
                  <li><Badge variant="outline">subjects</Badge> - Array of subject objects (optional)</li>
                  <li><Badge variant="outline">attendance</Badge> - Array of attendance records (optional)</li>
                  <li><Badge variant="outline">marks</Badge> - Array of marks records (optional)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4" />
                  Subject Object
                </h4>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li><Badge variant="outline">name</Badge> - Subject name (required)</li>
                  <li><Badge variant="outline">credits</Badge> - Credit hours from 1 to 6 (required)</li>
                  <li><Badge variant="outline">grade</Badge> - A, A-, B, B-, C, C-, D, or F (optional)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample JSON Format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{JSON.stringify(sampleJson, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <strong>Important Notes:</strong>
            <ul className="mt-2 space-y-1 ml-5 list-disc">
              <li>All required fields must be present.</li>
              <li>A(-), B(-), and C(-) are normalized to A-, B-, and C- automatically.</li>
              <li>Attendance requires attended classes to be between 0 and total classes.</li>
              <li>Marks can be scheduled with 0 total marks only when obtained marks is also 0.</li>
              <li>Assessment weightage follows IIITM limits: minor up to 30%, internal up to 30%, and major up to 50%.</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
