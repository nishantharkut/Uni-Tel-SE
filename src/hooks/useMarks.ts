
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marksService, type MarksRecord } from '@/services/academicService';
import { useToast } from '@/hooks/use-toast';

export const useMarks = () => {
  return useQuery({
    queryKey: ['marks'],
    queryFn: marksService.getAll,
  });
};

export const useMarksBySemester = (semesterId: string) => {
  return useQuery({
    queryKey: ['marks', 'semester', semesterId],
    queryFn: () => marksService.getBySemester(semesterId),
    enabled: !!semesterId,
  });
};

export const useCreateMarks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: marksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Marks record created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating marks record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useUpdateMarks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MarksRecord> }) =>
      marksService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Marks record updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating marks record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};

export const useDeleteMarks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: marksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      queryClient.invalidateQueries({ queryKey: ['academic-summary'] });
      toast({ title: 'Marks record deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting marks record', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
};
