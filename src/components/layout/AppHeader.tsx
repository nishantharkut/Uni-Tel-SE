
import { useState } from "react"
import { Bell, Search, User, LogOut, Menu, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MobileSearchModal } from "@/components/ui/MobileSearchModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown"
import { useAcademicSearch, type AcademicSearchResult } from "@/hooks/useAcademicSearch"

interface AppHeaderProps {
  user?: {
    full_name?: string
    email: string
    avatar_url?: string
  }
  onSignOut?: () => void
  onMobileMenuToggle?: () => void
  mobileMenuOpen?: boolean
}

export function AppHeader({ user, onSignOut, onMobileMenuToggle, mobileMenuOpen }: AppHeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { results: searchResults, saveRecentSearch } = useAcademicSearch(searchTerm);

  const handleSearchResult = (result: AcademicSearchResult) => {
    saveRecentSearch(searchTerm || result.title);
    setSearchTerm("");
    setSearchFocused(false);
    navigate(result.route);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-lg shadow-black/5">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Mobile menu + Branding */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-11 w-11 hover:bg-muted/60 transition-all duration-200 rounded-xl"
            onClick={onMobileMenuToggle}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <img src="/logo.png" alt="UNI-TEL Logo" className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-academic-primary/20 to-transparent rounded-lg blur-sm"></div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-academic-primary to-academic-secondary bg-clip-text text-transparent">
                UNI-TEL
              </span>
              <p className="text-xs text-muted-foreground font-medium -mt-1">Academic Hub</p>
            </div>
          </div>
        </div>

        {/* Center - Search (hidden on mobile, shown on tablet+) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-academic-primary transition-colors duration-200" />
            <Input
              placeholder="Search subjects, marks, attendance..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchResults[0]) {
                  event.preventDefault();
                  handleSearchResult(searchResults[0]);
                }
              }}
              className="pl-11 pr-4 bg-muted/40 border-muted-foreground/30 focus:bg-background focus:border-academic-primary/50 focus:ring-2 focus:ring-academic-primary/20 transition-all duration-300 rounded-xl h-11 shadow-sm hover:shadow-md"
            />
            {searchFocused && (
              <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border bg-background shadow-xl">
                <div className="max-h-96 overflow-y-auto p-2">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No matching academic records found.
                    </div>
                  ) : (
                    searchResults.slice(0, 8).map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="w-full rounded-lg p-3 text-left transition-colors hover:bg-muted"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSearchResult(result);
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{result.title}</span>
                          <Badge variant="outline" className="capitalize">{result.category}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.description}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-11 w-11 hover:bg-muted/60 transition-all duration-200 rounded-xl"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-muted/60 transition-all duration-200 p-0">
                <Avatar className="h-9 w-9 ring-2 ring-academic-primary/20 hover:ring-academic-primary/40 transition-all duration-200 shadow-sm">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-academic-primary to-academic-primary/80 text-white font-semibold text-sm shadow-sm">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 mr-2 bg-background/98 backdrop-blur-xl border border-border/50 shadow-xl shadow-black/10" align="end">
              <DropdownMenuLabel className="p-5">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-academic-primary/20">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-academic-primary to-academic-primary/80 text-white font-semibold">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="p-4 cursor-pointer hover:bg-muted/60 transition-colors duration-200 rounded-lg mx-2 my-1">
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 cursor-pointer hover:bg-muted/60 transition-colors duration-200 rounded-lg mx-2 my-1">
                <Bell className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={onSignOut} 
                className="p-4 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors duration-200 rounded-lg mx-2 my-1"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Search Modal */}
      <MobileSearchModal 
        isOpen={mobileSearchOpen} 
        onClose={() => setMobileSearchOpen(false)} 
      />
    </header>
  )
}
