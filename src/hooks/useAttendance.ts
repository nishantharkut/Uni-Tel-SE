
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, type AttendanceRecord } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';

export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: attendanceService.getAll,
  });
};

export const useAttendanceBySemester = (semesterId: string) => {
  return useQuery({
    queryKey: ['attendance', 'semester', semesterId],
    queryFn: () => attendanceService.getBySemester(semesterId),
    enabled: !!semesterId,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Attendance record created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating attendance record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AttendanceRecord> }) =>
      attendanceService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Attendance record updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating attendance record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Attendance record deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting attendance record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};
