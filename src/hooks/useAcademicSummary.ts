
import { useQuery } from '@tanstack/react-query';
import { academicSummaryService } from '@/services/academicService';

export const useAcademicSummary = () => {
  return useQuery({
    queryKey: ['academic-summary'],
    queryFn: academicSummaryService.get,
  });
};
