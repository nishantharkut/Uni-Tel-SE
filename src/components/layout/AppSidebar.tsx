import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Calendar, 
  ClipboardList, 
  FolderOpen, 
  BookmarkCheck, 
  Shield, 
  Settings, 
  GraduationCap,
  Home,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles,
  Zap,
  TrendingUp,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  Star,
  Download,
  Upload,
  MoreHorizontal,
  Palette,
  Images,
  Thumbtack,
  Heart,
  ChartLine,
  Fire,
  Magic,
  Gem,
  CaretUp,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useUserProfile } from "@/hooks/useUserProfile"

const academicItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, description: "Overview & stats" },
  { title: "Semesters", url: "/semesters", icon: GraduationCap, description: "Academic periods" },
  { title: "Attendance", url: "/attendance", icon: Calendar, description: "Track presence" },
  { title: "Marks", url: "/marks", icon: ClipboardList, description: "Exam scores" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Performance insights" },
]

const hubItems = [
  { title: "Browse Hub", url: "/coming-soon", icon: FolderOpen, description: "Explore resources" },
  { title: "My Uploads", url: "/coming-soon", icon: Upload, description: "Your contributions" },
  { title: "Bookmarks", url: "/coming-soon", icon: BookmarkCheck, description: "Saved items" },
]

const adminItems = [
  { title: "Moderation", url: "/coming-soon", icon: Shield, description: "Content review" },
  { title: "Users", url: "/coming-soon", icon: Users, description: "User management" },
]

const settingsItem = [
  { title: "Settings", url: "/settings", icon: Settings, description: "App preferences" },
]

interface AppSidebarProps {
  onToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function AppSidebar({ onToggle, mobileMenuOpen }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname
  const { profile, loading: profileLoading } = useUserProfile()

  // Note: Auto-collapse is now handled in the Layout component

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    onToggle?.()
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard"
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }


  return (
    <div 
      className={`
        fixed top-0 h-full flex flex-col font-sans overflow-hidden select-none transition-all duration-200 ease-out sidebar-container
        lg:left-4 lg:top-4 lg:h-[calc(100vh-2rem)] lg:rounded-2xl
        w-80 lg:w-auto
      `}
      style={{ 
        width: isCollapsed ? '80px' : '256px',
        backgroundColor: 'hsl(var(--academic-secondary))',
        color: 'hsl(var(--academic-accent))'
      }}
    >
      
      {/* Header */}
      <div 
        className="relative w-full h-20 rounded-2xl z-10 flex items-center transition-all duration-200"
        style={{ 
          width: isCollapsed ? 'calc(80px - 16px)' : 'calc(256px - 16px)', 
          left: '16px',
          backgroundColor: 'hsl(var(--academic-secondary))'
        }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 ml-3">
            <div className="w-6 h-6 bg-gradient-to-br from-academic-primary to-academic-primary/80 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span 
              className="text-lg font-bold transition-opacity duration-1000 text-white"
              style={{ 
                opacity: isCollapsed ? 0 : 1, 
                pointerEvents: isCollapsed ? 'none' : 'auto'
              }}
            >
              UNI-TEL
            </span>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute right-0 w-10 h-full items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200"
          style={{ left: isCollapsed ? 'calc(50% - 6px)' : 'auto', transform: isCollapsed ? 'translate(-50%)' : 'none' }}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-white transition-all duration-200 hover:scale-110" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-white transition-all duration-200 hover:scale-110" />
          )}
        </button>
        
        <hr 
          className="mx-4 border-t border-white/20"
        />
      </div>

      {/* Navigation Content */}
      <div 
        className="relative flex-1 w-full -mt-4 pt-4 transition-all duration-200 overflow-x-hidden"
        style={{ 
          width: isCollapsed ? '80px' : '256px',
          backgroundColor: 'hsl(var(--academic-secondary))'
        }}
      >
        

        {/* Academic Section */}
        <div className="relative z-10 mt-4">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                <GraduationCap className="w-3 h-3" />
                Academic
              </div>
            </div>
          )}
          {academicItems.map((item, index) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/dashboard" || item.url === "/"}
              className={({ isActive }) => 
                `relative ml-3 h-[40px] flex items-center cursor-pointer z-10 transition-all duration-200 rounded-lg mx-2 my-1 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md'
                }`
              }
            >
              <item.icon 
                className={`text-center transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                style={{ 
                  minWidth: isCollapsed ? 'calc(100% - 12px)' : '2.5rem'
                }} 
              />
              <span 
                className={`text-sm transition-opacity duration-1000 ${
                  isActive ? 'text-white font-medium' : 'text-white/80'
                }`}
                style={{ 
                  opacity: isCollapsed ? 0 : 1
                }}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 my-4">
          <hr className="border-t border-white/20" />
        </div>

        {/* Knowledge Hub Section */}
        <div className="relative z-10">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                <FolderOpen className="w-3 h-3" />
                Knowledge Hub
              </div>
            </div>
          )}
          {hubItems.map((item, index) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) => 
                `relative ml-3 h-[40px] flex items-center cursor-pointer z-10 transition-all duration-200 rounded-lg mx-2 my-1 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md'
                }`
              }
            >
              <item.icon 
                className={`text-center transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                style={{ 
                  minWidth: isCollapsed ? 'calc(100% - 12px)' : '2.5rem'
                }} 
              />
              <span 
                className={`text-sm transition-opacity duration-1000 ${
                  isActive ? 'text-white font-medium' : 'text-white/80'
                }`}
                style={{ 
                  opacity: isCollapsed ? 0 : 1
                }}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 my-4">
          <hr className="border-t border-white/20" />
        </div>

        {/* Administration Section */}
        <div className="relative z-10">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                <Shield className="w-3 h-3" />
                Administration
              </div>
            </div>
          )}
          {adminItems.map((item, index) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) => 
                `relative ml-3 h-[40px] flex items-center cursor-pointer z-10 transition-all duration-200 rounded-lg mx-2 my-1 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md'
                }`
              }
            >
              <item.icon 
                className={`text-center transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                style={{ 
                  minWidth: isCollapsed ? 'calc(100% - 12px)' : '2.5rem'
                }} 
              />
              <span 
                className={`text-sm transition-opacity duration-1000 ${
                  isActive ? 'text-white font-medium' : 'text-white/80'
                }`}
                style={{ 
                  opacity: isCollapsed ? 0 : 1
                }}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 my-4">
          <hr className="border-t border-white/20" />
        </div>

        {/* Settings Section - Special styling */}
        <div className="relative z-10">
          {settingsItem.map((item, index) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) => 
                `relative ml-3 h-[40px] flex items-center cursor-pointer z-10 transition-all duration-200 rounded-lg mx-2 my-1 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md'
                }`
              }
            >
              <item.icon 
                className={`text-center transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                style={{ 
                  minWidth: isCollapsed ? 'calc(100% - 12px)' : '2.5rem'
                }} 
              />
              <span 
                className={`text-sm transition-opacity duration-1000 ${
                  isActive ? 'text-white font-medium' : 'text-white/80'
                }`}
                style={{ 
                  opacity: isCollapsed ? 0 : 1
                }}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Spacing between Settings and Footer */}
        <div className="h-6"></div>
      </div>

      {/* Footer */}
      <div 
        className="relative w-full h-[60px] rounded-2xl flex flex-col z-10 transition-all duration-200"
        style={{ 
          width: isCollapsed ? '80px' : '256px',
          backgroundColor: 'hsl(var(--academic-primary))'
        }}
      >
        <div className="relative w-full h-[60px] flex items-center">
          <div 
            className="relative w-6 h-6 rounded-full overflow-hidden transition-all duration-200"
            style={{ 
              marginLeft: isCollapsed ? '0' : '12px',
              left: isCollapsed ? '50%' : '0',
              transform: isCollapsed ? 'translate(-50%)' : 'translate(0)'
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-academic-accent to-academic-accent/80 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
          
          {!isCollapsed && (
            <div 
              className="relative ml-3 flex flex-col justify-center py-2 transition-opacity duration-1000"
              style={{ 
                opacity: isCollapsed ? 0 : 1, 
                pointerEvents: isCollapsed ? 'none' : 'auto' 
              }}
            >
              <span className="text-xs font-medium text-white leading-tight">
                {profileLoading ? 'Loading...' : profile?.full_name || 'User'}
              </span>
              <span className="text-xs text-white/70 leading-tight">
                {profile?.college || 'University'}
              </span>
              <span className="text-xs text-white/50 capitalize leading-tight">
                {profile?.role || 'Student'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}