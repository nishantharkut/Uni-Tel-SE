import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Clock, 
  Target, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Zap,
  TrendingUp,
  BookOpen,
  Users,
  Menu,
  X
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setUserProfile({
              full_name: data.full_name || user.user_metadata?.full_name || 'User',
              email: data.email || user.email
            });
          } else {
            setUserProfile({
              full_name: user.user_metadata?.full_name || 'User',
              email: user.email
            });
          }
        } catch (error) {
          setUserProfile({
            full_name: user.user_metadata?.full_name || 'User',
            email: user.email
          });
        }
      }
    };
    
    loadUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center group">
              <img src="/logo.png" alt="UNI-TEL" className="h-8 w-8 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-900">UNI-TEL</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {authLoading ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : user ? (
                  <>
                    <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {userProfile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {userProfile?.full_name || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/auth')}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('/auth')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section - Asymmetric Layout */}
        <section className="relative pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-40 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Content - Takes 7 columns */}
              <div className="lg:col-span-7 lg:pr-12">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>10,000+ students trust UNI-TEL</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                  Stop guessing.<br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Start tracking.
                  </span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                  The only academic tracker that actually helps you improve. Real-time CGPA, smart attendance alerts, and performance insights that matter.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button
                    onClick={() => navigate('/auth')}
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    Start tracking free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      const demo = document.getElementById('demo');
                      demo?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    See how it works
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  <div className="flex items-center text-gray-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Free forever</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">No credit card</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-medium">Setup in 5 minutes</span>
                  </div>
                </div>
              </div>

              {/* Right Visual - Takes 5 columns, offset */}
              <div className="lg:col-span-5 lg:col-start-8 lg:-mt-12">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Your Dashboard</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Semester 2024</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Current CGPA</div>
                          <div className="text-4xl font-bold text-gray-900">3.85</div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          +0.15 ↑
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <div className="text-xs text-gray-600 mb-1">Attendance</div>
                          <div className="text-2xl font-bold text-blue-600">92%</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">Subjects</div>
                          <div className="text-2xl font-bold text-purple-600">6</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {['Math', 'Physics', 'Chemistry', 'English'].map((subject, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{subject}</span>
                          <div className="flex items-center space-x-3 flex-1 mx-4">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                                style={{ width: `${85 + idx * 3}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-10 text-right">
                              {85 + idx * 3}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-900">Trending up</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Unique Layout */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                Why students choose us
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 max-w-2xl">
                Built for students who want results, not excuses
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Every feature is designed around one thing: helping you actually improve your grades.
              </p>
            </div>

            <div className="space-y-12">
              {/* Feature 1 - Large */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                    <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Real-time Grade Tracking</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Watch your CGPA update instantly as you add grades. No manual calculations, no spreadsheets, no confusion.
                    </p>
                    <ul className="space-y-3">
                      {['Automatic CGPA calculation', 'Subject-wise breakdown', 'Semester comparisons', 'Grade predictions'].map((item, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overall CGPA</span>
                        <span className="text-2xl font-bold text-gray-900">3.85</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '77%' }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        {['Math', 'Physics', 'Chem', 'English'].map((s, i) => (
                          <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{s}</div>
                            <div className="text-lg font-bold text-gray-900">{85 + i * 3}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Reversed */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attendance Status</span>
                        <span className="text-sm font-bold text-green-600">92%</span>
                      </div>
                      {['Math', 'Physics', 'Chemistry', 'English'].map((s, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700">{s}</span>
                            <span className={i === 2 ? 'text-red-600' : 'text-green-600'}>{85 + i * 3}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${i === 2 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${85 + i * 3}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
                    <Clock className="h-12 w-12 text-orange-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Never Miss a Class</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Get smart alerts when your attendance drops. Know exactly how many classes you can miss before it affects your grade.
                    </p>
                    <ul className="space-y-3">
                      {['Low attendance warnings', 'Required % tracking', 'Subject-wise breakdown', 'Automatic calculations'].map((item, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Other Features Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: TrendingUp, title: 'Performance Insights', desc: 'See trends and patterns in your academic performance over time.' },
                  { icon: Target, title: 'Goal Tracking', desc: 'Set CGPA targets and track your progress with visual milestones.' },
                  { icon: Shield, title: 'Private & Secure', desc: 'Your data stays private. We never share it with anyone.' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
                Product Demo
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                See how it works in 2 minutes
              </h2>
              <p className="text-xl text-gray-600">
                Watch a real student use UNI-TEL to track their grades and improve their CGPA
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="group flex items-center justify-center w-24 h-24 bg-white rounded-full hover:scale-110 transition-transform shadow-xl">
                    <Play className="h-10 w-10 text-gray-900 ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                  HD • 2:30
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Unique Design */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10,000+', label: 'Students using UNI-TEL', icon: Users },
                { value: '95%', label: 'See grade improvement', icon: TrendingUp },
                { value: '500+', label: 'Universities represented', icon: BookOpen },
                { value: '4.9/5', label: 'Average student rating', icon: Star }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-white/20 rounded-full mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - Asymmetric */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
                Real Results
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 max-w-2xl">
                Don't take our word for it
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah M.',
                  role: 'CS Student, MIT',
                  text: 'My CGPA went from 3.2 to 3.5 in one semester. UNI-TEL showed me exactly where I was losing marks.',
                  cgpa: '+0.3 CGPA'
                },
                {
                  name: 'Alex J.',
                  role: 'Business, Stanford',
                  text: 'The attendance alerts saved my grade. I would have failed without knowing I was at 78%.',
                  cgpa: 'Saved grade'
                },
                {
                  name: 'Maria R.',
                  role: 'Engineering, UC Berkeley',
                  text: 'Finally, a tool that actually helps. The analytics showed me Physics was dragging me down.',
                  cgpa: '+0.25 CGPA'
                }
              ].map((testimonial, idx) => (
                <div key={idx} className={`bg-white rounded-xl p-6 border-2 ${idx === 1 ? 'border-blue-200 shadow-lg' : 'border-gray-200'} hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {testimonial.cgpa}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-base">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Unique */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              Start Today
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Ready to actually improve your grades?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join 10,000+ students who stopped guessing and started tracking. Free forever, no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/auth')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center text-lg"
              >
                Start tracking free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span>5-minute setup</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="UNI-TEL" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-white">UNI-TEL</span>
              </div>
              <p className="text-sm">
                Empowering students worldwide with smart academic management tools.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/auth')} className="hover:text-white">Get Started</button></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>© 2024 UNI-TEL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
