
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectService, type Subject } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });
};

export const useSubjectsBySemester = (semesterId: string) => {
  return useQuery({
    queryKey: ['subjects', 'semester', semesterId],
    queryFn: () => subjectService.getBySemester(semesterId),
    enabled: !!semesterId,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Subject created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating subject', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Subject> }) =>
      subjectService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Subject updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating subject', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: subjectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Subject deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting subject', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};
