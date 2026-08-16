
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { semesterService, type Semester } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';

export const useSemesters = () => {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: semesterService.getAll,
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: semesterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Semester created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating semester', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Semester> }) =>
      semesterService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Semester updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating semester', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: semesterService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Semester deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting semester', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};
