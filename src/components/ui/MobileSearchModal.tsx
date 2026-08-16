import { useState } from 'react';
import { Search, X, Clock, TrendingUp, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAcademicSearch, type AcademicSearchResult } from '@/hooks/useAcademicSearch';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { results, recentSearches, saveRecentSearch } = useAcademicSearch(searchTerm);

  // Save search to recent searches
  const handleSearch = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    saveRecentSearch(cleanTerm);
    const firstResult = results[0];
    if (firstResult) {
      navigate(firstResult.route);
      onClose();
    }
  };

  const handleResult = (result: AcademicSearchResult) => {
    saveRecentSearch(searchTerm || result.title);
    navigate(result.route);
    onClose();
  };

  // Quick search suggestions
  const quickSearches = [
    { label: 'Marks & Grades', route: '/marks', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Attendance', route: '/attendance', icon: Calendar, color: 'text-blue-600' },
    { label: 'Subjects', route: '/semesters', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Analytics', route: '/analytics', icon: TrendingUp, color: 'text-orange-600' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects, marks, attendance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchTerm);
                }
              }}
              className="pl-10 pr-4 h-12 text-base rounded-xl border-2 focus:border-academic-primary transition-colors"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Quick Searches */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Search</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickSearches.map((item, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      saveRecentSearch(item.label);
                      navigate(item.route);
                      onClose();
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted/50 ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSearchTerm(search)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchTerm && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Search Results</h3>
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground/60" />
                    </div>
                    <p className="text-muted-foreground">No matching academic records found.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleResult(result)}
                        className="w-full rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{result.title}</p>
                              <Badge variant="outline" className="capitalize">{result.category}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
