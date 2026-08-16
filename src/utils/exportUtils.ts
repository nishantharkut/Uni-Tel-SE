import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have types
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Semester, Subject, AttendanceRecord, MarksRecord } from '@/services/academicService';

// PDF Export Functions
export function exportToPDF(
  semesters: Semester[],
  subjects: Subject[],
  attendance: AttendanceRecord[],
  marks: MarksRecord[],
  cgpa: number | null
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Academic Transcript', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // CGPA Section
  if (cgpa !== null) {
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Overall Performance', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(`CGPA: ${cgpa.toFixed(2)}`, 20, yPosition);
    yPosition += 15;
  }

  // Semesters Table
  if (semesters.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Semester Summary', 20, yPosition);
    yPosition += 10;

    const semesterData = semesters.map(sem => [
      `Semester ${sem.number}`,
      sem.sgpa?.toFixed(2) || 'N/A',
      sem.total_credits?.toString() || '0'
    ]);

    autoTable(doc, {
      head: [['Semester', 'SGPA', 'Credits']],
      body: semesterData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Subjects Table
  if (subjects.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Subject Details', 20, yPosition);
    yPosition += 10;

    const subjectData = subjects.map(sub => [
      sub.name,
      sub.credits.toString(),
      sub.grade || 'N/A',
      sub.semester_id ? `Sem ${semesters.find(s => s.id === sub.semester_id)?.number || 'N/A'}` : 'N/A'
    ]);

    autoTable(doc, {
      head: [['Subject', 'Credits', 'Grade', 'Semester']],
      body: subjectData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Attendance Summary
  if (attendance.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Attendance Summary', 20, yPosition);
    yPosition += 10;

    const attendanceData = attendance.map(att => {
      const percentage = att.total_classes > 0
        ? Math.round((att.attended_classes / att.total_classes) * 100)
        : 0;
      return [
        att.subject_name,
        `${att.attended_classes}/${att.total_classes}`,
        `${percentage}%`
      ];
    });

    autoTable(doc, {
      head: [['Subject', 'Classes', 'Percentage']],
      body: attendanceData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Marks Summary
  if (marks.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Marks Summary', 20, yPosition);
    yPosition += 10;

    const marksData = marks.map(mark => {
      const percentage = mark.total_marks > 0
        ? Math.round((mark.obtained_marks / mark.total_marks) * 100)
        : 0;
      return [
        mark.subject_name,
        mark.exam_type,
        `${mark.obtained_marks}/${mark.total_marks}`,
        `${percentage}%`
      ];
    });

    autoTable(doc, {
      head: [['Subject', 'Exam Type', 'Marks', 'Percentage']],
      body: marksData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 }
      }
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`academic-transcript-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Excel Export Functions
export function exportToExcel(
  semesters: Semester[],
  subjects: Subject[],
  attendance: AttendanceRecord[],
  marks: MarksRecord[],
  cgpa: number | null
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Academic Summary'],
    ['Generated on', format(new Date(), 'MMMM dd, yyyy')],
    ['Current CGPA', cgpa?.toFixed(2) || 'N/A'],
    ['Total Semesters', semesters.length.toString()],
    ['Total Subjects', subjects.length.toString()],
    ['Total Credits', subjects.reduce((sum, s) => sum + s.credits, 0).toString()]
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Semesters Sheet
  if (semesters.length > 0) {
    const semesterData = [
      ['Semester', 'SGPA', 'Credits']
    ];
    
    semesters.forEach(sem => {
      semesterData.push([
        `Semester ${sem.number}`,
        sem.sgpa?.toFixed(2) || 'N/A',
        sem.total_credits?.toString() || '0',
      ]);
    });

    const semesterSheet = XLSX.utils.aoa_to_sheet(semesterData);
    XLSX.utils.book_append_sheet(workbook, semesterSheet, 'Semesters');
  }

  // Subjects Sheet
  if (subjects.length > 0) {
    const subjectData = [
      ['Subject Name', 'Credits', 'Grade', 'Semester', 'Created At']
    ];

    subjects.forEach(sub => {
      subjectData.push([
        sub.name,
        sub.credits.toString(),
        sub.grade || 'N/A',
        sub.semester_id ? `Sem ${semesters.find(s => s.id === sub.semester_id)?.number || 'N/A'}` : 'N/A',
        sub.created_at ? format(new Date(sub.created_at), 'yyyy-MM-dd') : 'N/A'
      ]);
    });

    const subjectSheet = XLSX.utils.aoa_to_sheet(subjectData);
    XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Subjects');
  }

  // Attendance Sheet
  if (attendance.length > 0) {
    const attendanceData = [
      ['Subject', 'Attended Classes', 'Total Classes', 'Percentage', 'Semester']
    ];

    attendance.forEach(att => {
      const percentage = att.total_classes > 0
        ? Math.round((att.attended_classes / att.total_classes) * 100)
        : 0;
      attendanceData.push([
        att.subject_name,
        att.attended_classes.toString(),
        att.total_classes.toString(),
        `${percentage}%`,
        att.semester_id ? `Sem ${semesters.find(s => s.id === att.semester_id)?.number || 'N/A'}` : 'N/A'
      ]);
    });

    const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
  }

  // Marks Sheet
  if (marks.length > 0) {
    const marksData = [
      ['Subject', 'Exam Type', 'Obtained Marks', 'Total Marks', 'Percentage', 'Weightage', 'Semester']
    ];

    marks.forEach(mark => {
      const percentage = mark.total_marks > 0
        ? Math.round((mark.obtained_marks / mark.total_marks) * 100)
        : 0;
      marksData.push([
        mark.subject_name,
        mark.exam_type,
        mark.obtained_marks.toString(),
        mark.total_marks.toString(),
        `${percentage}%`,
        (mark as any).weightage?.toString() || '100',
        mark.semester_id ? `Sem ${semesters.find(s => s.id === mark.semester_id)?.number || 'N/A'}` : 'N/A'
      ]);
    });

    const marksSheet = XLSX.utils.aoa_to_sheet(marksData);
    XLSX.utils.book_append_sheet(workbook, marksSheet, 'Marks');
  }

  // Save the Excel file
  XLSX.writeFile(workbook, `academic-data-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// Export specific data types
export function exportSemestersToPDF(semesters: Semester[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Semester Summary', 20, 20);
  
  const data = semesters.map(sem => [
    `Semester ${sem.number}`,
    sem.sgpa?.toFixed(2) || 'N/A',
    sem.total_credits?.toString() || '0'
  ]);

  autoTable(doc, {
    head: [['Semester', 'SGPA', 'Credits']],
    body: data,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save(`semesters-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportMarksToExcel(marks: MarksRecord[]) {
  const workbook = XLSX.utils.book_new();
  
  const marksData = [
    ['Subject', 'Exam Type', 'Obtained Marks', 'Total Marks', 'Percentage']
  ];

  marks.forEach(mark => {
    const percentage = mark.total_marks > 0
      ? Math.round((mark.obtained_marks / mark.total_marks) * 100)
      : 0;
    marksData.push([
      mark.subject_name,
      mark.exam_type,
      mark.obtained_marks.toString(),
      mark.total_marks.toString(),
      `${percentage}%`
    ]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(marksData);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Marks');
  XLSX.writeFile(workbook, `marks-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

