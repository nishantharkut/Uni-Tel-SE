
export const gradeToPoints = (grade: string): number => {
  switch (grade) {
    case 'A': return 10.0;
    case 'A-': return 9.0;
    case 'B': return 8.0;
    case 'B-': return 7.0;
    case 'C': return 6.0;
    case 'C-': return 5.0;
    case 'D': return 4.0;
    case 'E': case 'F': case 'I': return 0.0;
    default: return 0.0;
  }
};

export const validateGrade = (grade: string): boolean => {
  return ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I'].includes(grade);
};

export const computeSGPA = (subjects: Array<{ credits: number; grade?: string }>): number => {
  // According to official formula: SGPA = (Σ c_i * p_i) / (Σ c_i)
  // Only include subjects with valid grades (as mentioned in Table 1)
  // E, F, I are valid grades with 0 points and should be included
  const subjectsWithGrades = subjects.filter(subject => 
    subject.grade && validateGrade(subject.grade)
  );
  
  if (subjectsWithGrades.length === 0) return 0;
  
  const totalCredits = subjectsWithGrades.reduce((sum, subject) => sum + subject.credits, 0);
  if (totalCredits === 0) return 0;
  
  const weightedPoints = subjectsWithGrades.reduce((sum, subject) => {
    const points = gradeToPoints(subject.grade!);
    return sum + (subject.credits * points);
  }, 0);
  
  return Math.round((weightedPoints / totalCredits) * 100) / 100;
};

export const computeCGPA = (allSubjects: Array<{ credits: number; grade?: string }>): number => {
  // According to official formula: CGPA = (Σ c_j * p_j) / (Σ c_j)
  // Calculate directly from ALL subjects across ALL semesters, not from SGPA values
  // Only include subjects with valid grades (as mentioned in Table 1)
  // E, F, I are valid grades with 0 points and should be included
  const subjectsWithGrades = allSubjects.filter(subject => 
    subject.grade && validateGrade(subject.grade)
  );
  
  if (subjectsWithGrades.length === 0) return 0;
  
  const totalCredits = subjectsWithGrades.reduce((sum, subject) => sum + subject.credits, 0);
  if (totalCredits === 0) return 0;
  
  const weightedPoints = subjectsWithGrades.reduce((sum, subject) => {
    const points = gradeToPoints(subject.grade!);
    return sum + (subject.credits * points);
  }, 0);
  
  return Math.round((weightedPoints / totalCredits) * 100) / 100;
};

export const getGradeColor = (grade?: string): string => {
  if (!grade) return 'secondary';
  
  switch (grade) {
    case 'A':
    case 'A-':
      return 'color-accent-light';
    case 'B':
    case 'B-':
      return 'color-primary-light';
    case 'C':
    case 'C-':
      return 'color-warning-light';
    default:
      return 'color-danger-light';
  }
};

export const getAttendanceStatus = (percentage: number): { status: string; color: string } => {
  if (percentage >= 90) return { status: 'Excellent', color: 'color-accent-light' };
  if (percentage >= 80) return { status: 'Good', color: 'color-primary-light' };
  if (percentage >= 75) return { status: 'Average', color: 'color-warning-light' };
  return { status: 'Poor', color: 'color-danger-light' };
};
