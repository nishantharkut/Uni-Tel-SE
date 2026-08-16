import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp } from 'lucide-react';
import type { MarksRecord, Subject } from '@/services/academicService';
import { calculateEarnedCredits } from '@/domain/academicRules';
import {
  calculateRequiredAverageForTarget,
  estimateRequiredAverageGradePoints,
} from '@/domain/studentPlanning';

interface StudentPlanningPanelProps {
  subjects: Subject[];
  marks: MarksRecord[];
  currentCGPA?: number | null;
}

export function StudentPlanningPanel({ subjects, marks, currentCGPA }: StudentPlanningPanelProps) {
  const [targetCGPA, setTargetCGPA] = useState(8.5);
  const [remainingCredits, setRemainingCredits] = useState(20);
  const [targetMarks, setTargetMarks] = useState(75);

  const subjectNames = useMemo(
    () => [...new Set(marks.map((mark) => mark.subject_name).filter(Boolean))].sort(),
    [marks]
  );
  const [selectedSubject, setSelectedSubject] = useState(subjectNames[0] ?? '');
  const activeSubject = selectedSubject || subjectNames[0] || '';
  const subjectMarks = marks.filter((mark) => mark.subject_name === activeSubject);

  const earnedCredits = calculateEarnedCredits(subjects);
  const cgpaPlan = estimateRequiredAverageGradePoints({
    currentCgpa: currentCGPA ?? 0,
    completedCredits: earnedCredits,
    remainingCredits,
    targetCgpa: targetCGPA,
  });
  const marksPlan = calculateRequiredAverageForTarget(subjectMarks, targetMarks);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-academic-primary" />
          Student Planning Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">CGPA Target Planner</h3>
              <p className="text-sm text-muted-foreground">Estimate the future average grade points needed.</p>
            </div>
            <Badge variant={cgpaPlan.feasible ? 'default' : 'destructive'}>
              {cgpaPlan.feasible ? 'Feasible' : 'High Risk'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target-cgpa">Target CGPA</Label>
              <Input
                id="target-cgpa"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={targetCGPA}
                onChange={(event) => setTargetCGPA(Number(event.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="remaining-credits">Remaining Credits</Label>
              <Input
                id="remaining-credits"
                type="number"
                min="0"
                step="1"
                value={remainingCredits}
                onChange={(event) => setRemainingCredits(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Current CGPA: {(currentCGPA ?? 0).toFixed(2)} | Earned credits: {earnedCredits}
            </div>
            <p className="mt-2 font-medium">
              {cgpaPlan.requiredAverageGradePoints === null
                ? 'Required average: not available'
                : `Required average: ${Math.max(0, cgpaPlan.requiredAverageGradePoints).toFixed(2)} / 10`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{cgpaPlan.message}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Marks Target Planner</h3>
              <p className="text-sm text-muted-foreground">Estimate marks needed in remaining weightage.</p>
            </div>
            <Badge variant={marksPlan.feasible ? 'default' : 'destructive'}>
              {marksPlan.feasible ? 'Feasible' : 'High Risk'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Subject</Label>
              <Select value={activeSubject} onValueChange={setSelectedSubject} disabled={subjectNames.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="No marks recorded" />
                </SelectTrigger>
                <SelectContent>
                  {subjectNames.map((subjectName) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-marks">Target Overall %</Label>
              <Input
                id="target-marks"
                type="number"
                min="0"
                max="100"
                step="1"
                value={targetMarks}
                onChange={(event) => setTargetMarks(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Recorded weightage: {marksPlan.recordedWeightage}% | Remaining: {marksPlan.remainingWeightage}%
            </p>
            <p className="mt-2 font-medium">
              Current weighted score: {marksPlan.currentWeightedScore.toFixed(2)}%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{marksPlan.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
