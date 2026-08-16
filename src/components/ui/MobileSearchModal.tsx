import { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const handleSearch = (term: string) => {
    if (term.trim()) {
      const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      onClose();
    }
  };

  // Quick search suggestions
  const quickSearches = [
    { label: 'Marks & Grades', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Attendance', icon: Calendar, color: 'text-blue-600' },
    { label: 'Subjects', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Analytics', icon: TrendingUp, color: 'text-orange-600' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, papers, subjects..."
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
                    onClick={() => handleSearch(item.label)}
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
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Placeholder */}
            {searchTerm && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Search Results</h3>
                <div className="text-center py-8">
                  <div className="p-4 rounded-2xl bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-muted-foreground">Search functionality coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
