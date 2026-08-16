import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  CheckCircle, 
  BarChart3, 
  Shield, 
  Zap,
  TrendingUp,
  BookOpen,
  Target,
  Sparkles,
  Star,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 1) return { label: 'Weak', color: 'text-academic-danger' };
    if (passwordStrength <= 3) return { label: 'Medium', color: 'text-academic-warning' };
    return { label: 'Strong', color: 'text-academic-success' };
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to your account.",
        variant: "default",
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email for the verification link.",
        variant: "default",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-academic-primary/5 flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-academic-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-academic-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <div className="w-full max-w-7xl mx-auto mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            ← Back to Landing
          </Button>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="UNI-TEL Logo" 
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-academic-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-academic-primary to-academic-secondary bg-clip-text text-transparent">
              UNI-TEL
            </h1>
          </div>
        </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Auth Form */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} lg:order-2 w-full`}>
          <Card className="border-2 border-border/50 shadow-2xl bg-background/95 backdrop-blur-md w-full max-w-md mx-auto lg:max-w-none lg:min-h-[600px] hover:shadow-3xl transition-shadow">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-academic-primary font-semibold text-sm sm:text-base transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-academic-primary font-semibold text-sm sm:text-base transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="p-4 sm:p-6 lg:p-8 xl:p-10 mt-4 sm:mt-6">
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Welcome Back!</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Sign in to continue your academic journey</p>
                  </div>
                  
                  <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5 lg:space-y-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="signin-email" className="text-xs sm:text-sm font-semibold text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 focus:border-academic-primary focus:ring-2 focus:ring-academic-primary/20 transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-xs sm:text-sm font-semibold text-foreground">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-academic-primary hover:text-academic-primary/80 font-medium"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 border-2 focus:border-academic-primary focus:ring-2 focus:ring-academic-primary/20 transition-all text-sm sm:text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all group mt-4 sm:mt-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Sign In</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="p-4 sm:p-6 lg:p-8 xl:p-10 mt-4 sm:mt-6">
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Create Account</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Join thousands of students already using UNI-TEL</p>
                  </div>
                  
                  <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5 lg:space-y-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="signup-name" className="text-xs sm:text-sm font-semibold text-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          name="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 focus:border-academic-primary focus:ring-2 focus:ring-academic-primary/20 transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="signup-email" className="text-xs sm:text-sm font-semibold text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 focus:border-academic-primary focus:ring-2 focus:ring-academic-primary/20 transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="signup-password" className="text-xs sm:text-sm font-semibold text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          name="password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 border-2 focus:border-academic-primary focus:ring-2 focus:ring-academic-primary/20 transition-all text-sm sm:text-base"
                          required
                          minLength={6}
                          onChange={handlePasswordChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {passwordStrength > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={getPasswordStrengthLabel().color + ' font-medium'}>
                              {getPasswordStrengthLabel().label}
                            </span>
                            <span className="text-muted-foreground">{passwordStrength}/5</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                passwordStrength <= 1 ? 'bg-academic-danger' :
                                passwordStrength <= 3 ? 'bg-academic-warning' : 'bg-academic-success'
                              }`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <div className={`flex items-center gap-1 ${passwordStrength >= 1 ? 'text-academic-success' : ''}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength >= 1 ? 'fill-academic-success text-academic-success' : ''}`} />
                          <span>6+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength >= 3 ? 'text-academic-success' : ''}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength >= 3 ? 'fill-academic-success text-academic-success' : ''}`} />
                          <span>Mixed case</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength >= 4 ? 'text-academic-success' : ''}`}>
                          <CheckCircle className={`w-3 h-3 ${passwordStrength >= 4 ? 'fill-academic-success text-academic-success' : ''}`} />
                          <span>Numbers</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all group mt-4 sm:mt-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Enhanced Content Section */}
        <div className={`space-y-6 sm:space-y-8 lg:space-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} lg:order-1 lg:sticky lg:top-8`}>
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-academic-primary/10 border border-academic-primary/20 mb-2 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-academic-primary" />
              <span className="text-xs sm:text-sm font-medium text-academic-primary">Trusted by 10,000+ students</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight text-center lg:text-left">
              Start Your
              <span className="block bg-gradient-to-r from-academic-primary to-academic-secondary bg-clip-text text-transparent"> Academic Journey</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-center lg:text-left max-w-xl">
              Join thousands of students who are achieving better grades with smart tracking and analytics.
            </p>
          </div>

          {/* Enhanced Features List */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-5">
            {[
              { icon: BarChart3, title: 'Smart Grade Tracking', desc: 'Real-time CGPA calculation', bgColor: 'bg-academic-primary/10', iconColor: 'text-academic-primary' },
              { icon: TrendingUp, title: 'Performance Analytics', desc: 'Visual insights & trends', bgColor: 'bg-academic-success/10', iconColor: 'text-academic-success' },
              { icon: BookOpen, title: 'Attendance Management', desc: 'Never miss a class', bgColor: 'bg-academic-warning/10', iconColor: 'text-academic-warning' },
              { icon: Target, title: 'Goal Setting', desc: 'Track your academic goals', bgColor: 'bg-academic-danger/10', iconColor: 'text-academic-danger' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected', bgColor: 'bg-academic-accent/10', iconColor: 'text-academic-accent' }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group cursor-default justify-center lg:justify-start"
              >
                <div className={`p-2 sm:p-3 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-6 sm:pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-academic-primary mb-1">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl lg:text-3xl font-bold text-academic-warning mb-1">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-academic-warning" />
                <span>4.9</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-academic-success mb-1">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Improve</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 sm:pt-6 border-t border-border">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center lg:justify-start text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-academic-success flex-shrink-0" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-academic-primary flex-shrink-0" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-academic-warning flex-shrink-0" />
                <span>5-Min Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AuthPage;