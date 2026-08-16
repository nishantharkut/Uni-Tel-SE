import { supabase } from '@/integrations/supabase/client';

export interface DataValidationIssue {
  table_name: string;
  issue_type: string;
  issue_description: string;
  record_id: string;
}

export interface CleanupResult {
  cleaned_table: string;
  records_deleted: number;
}

// Validation service for data integrity
export const validationService = {
  // Validate academic data consistency
  async validateDataConsistency(): Promise<DataValidationIssue[]> {
    const { data, error } = await supabase
      .rpc('validate_academic_data_consistency');
    if (error) throw error;
    return data || [];
  },

  // Clean up orphaned data
  async cleanupOrphanedData(): Promise<CleanupResult[]> {
    const { data, error } = await supabase
      .rpc('cleanup_orphaned_academic_data');
    if (error) throw error;
    return data || [];
  },

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  },

  // Validate grade letter
  validateGrade(grade: string): boolean {
    const validGrades = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I'];
    return validGrades.includes(grade);
  },

  // Validate exam type
  validateExamType(examType: string): boolean {
    const validTypes = [
      'Quiz', 'Mid Term', 'End Term', 'Assignment', 'Lab Exam', 
      'Viva', 'Project', 'Presentation', 'Practical', 'Other'
    ];
    return validTypes.includes(examType);
  },

  // Validate semester number
  validateSemesterNumber(number: number): boolean {
    return number >= 1 && number <= 12;
  },

  // Validate credits
  validateCredits(credits: number): boolean {
    return credits >= 1 && credits <= 6;
  },

  // Validate SGPA
  validateSGPA(sgpa: number): boolean {
    return sgpa >= 0 && sgpa <= 10;
  },

  // Validate percentage
  validatePercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100;
  },

  // Validate marks
  validateMarks(obtained: number, total: number): boolean {
    return total > 0 && obtained >= 0 && obtained <= total;
  },

  // Validate attendance
  validateAttendance(attended: number, total: number): boolean {
    return total >= 0 && attended >= 0 && attended <= total;
  },

  // Validate text length
  validateTextLength(text: string, maxLength: number): boolean {
    return text.length <= maxLength;
  },

  // Validate required fields
  validateRequiredFields(data: Record<string, any>, requiredFields: string[]): string[] {
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    return missingFields;
  },

  // Comprehensive validation for semester data
  validateSemesterData(data: {
    number: number;
    sgpa?: number;
    total_credits?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.validateSemesterNumber(data.number)) {
      errors.push('Semester number must be between 1 and 12');
    }

    if (data.sgpa !== undefined && !this.validateSGPA(data.sgpa)) {
      errors.push('SGPA must be between 0 and 10');
    }

    if (data.total_credits !== undefined && data.total_credits < 0) {
      errors.push('Total credits cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Comprehensive validation for subject data
  validateSubjectData(data: {
    name: string;
    credits: number;
    grade?: string;
    semester_id: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Subject name is required');
    }

    if (!this.validateCredits(data.credits)) {
      errors.push('Credits must be between 1 and 6');
    }

    if (data.grade && !this.validateGrade(data.grade)) {
      errors.push('Invalid grade letter');
    }

    if (!data.semester_id) {
      errors.push('Semester ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Comprehensive validation for attendance data
  validateAttendanceData(data: {
    subject_name: string;
    total_classes: number;
    attended_classes: number;
    semester_id: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.subject_name || data.subject_name.trim() === '') {
      errors.push('Subject name is required');
    }

    if (!this.validateAttendance(data.attended_classes, data.total_classes)) {
      errors.push('Attended classes cannot exceed total classes');
    }

    if (data.total_classes < 0) {
      errors.push('Total classes cannot be negative');
    }

    if (data.attended_classes < 0) {
      errors.push('Attended classes cannot be negative');
    }

    if (!data.semester_id) {
      errors.push('Semester ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Comprehensive validation for marks data
  validateMarksData(data: {
    subject_name: string;
    exam_type: string;
    total_marks: number;
    obtained_marks: number;
    semester_id: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.subject_name || data.subject_name.trim() === '') {
      errors.push('Subject name is required');
    }

    if (!this.validateExamType(data.exam_type)) {
      errors.push('Invalid exam type');
    }

    if (!this.validateMarks(data.obtained_marks, data.total_marks)) {
      errors.push('Obtained marks cannot exceed total marks');
    }

    if (data.total_marks <= 0) {
      errors.push('Total marks must be greater than 0');
    }

    if (data.obtained_marks < 0) {
      errors.push('Obtained marks cannot be negative');
    }

    if (!data.semester_id) {
      errors.push('Semester ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};


