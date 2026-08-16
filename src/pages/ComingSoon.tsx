import { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  BarChart3, 
  Calendar, 
  FileText,
  Sparkles,
  Clock,
  Mail,
  Bell,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: GraduationCap,
    title: "Academic Management",
    description: "Track semesters, subjects, and academic progress with ease",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Calendar,
    title: "Attendance Tracking", 
    description: "Monitor attendance records and get insights on your presence",
    color: "from-green-500 to-green-600"
  },
  {
    icon: FileText,
    title: "Marks & Grades",
    description: "Record and analyze your academic performance",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights into your academic journey",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Users,
    title: "Knowledge Hub",
    description: "Share and discover academic resources with peers",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay updated with important academic deadlines",
    color: "from-indigo-500 to-indigo-600"
  }
]

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Calculate time until launch (example: 30 days from now)
  useEffect(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 30) // 30 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
      console.log('Subscribed:', email)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-academic-primary to-academic-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">UNI-TEL</h1>
                <p className="text-sm text-muted-foreground">Academic Hub</p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <Badge className="mb-4 px-4 py-2 text-sm">
                <Sparkles className="w-3 h-3 mr-2" />
                Next Generation Academic Platform
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-academic-primary to-academic-primary/60 bg-clip-text text-transparent mb-6">
                UNI-TEL
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The ultimate academic companion that transforms how students manage their educational journey. 
                Track progress, analyze performance, and achieve academic excellence.
              </p>
            </div>

            {/* Countdown Timer */}
            <Card className="mb-12 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-academic-primary" />
                  Launch Countdown
                </CardTitle>
                <CardDescription>We're putting the finishing touches on your academic hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-academic-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-academic-primary">{timeLeft.days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="bg-academic-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-academic-primary">{timeLeft.hours}</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="bg-academic-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-academic-primary">{timeLeft.minutes}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="bg-academic-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-academic-primary">{timeLeft.seconds}</div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Subscription */}
            <Card className="mb-12 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Get Notified</CardTitle>
                <CardDescription className="text-center">
                  Be the first to know when we launch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button type="submit" className="px-6">
                        <Mail className="w-4 h-4 mr-2" />
                        Notify Me
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thanks! We'll notify you when we launch.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything You Need for Academic Success</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                UNI-TEL brings together all the tools you need to excel in your academic journey
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-academic-primary to-academic-primary/80">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Academic Journey?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already preparing for a better academic experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8">
                <Bell className="w-4 h-4 mr-2" />
                Get Early Access
              </Button>
              <Button size="lg" variant="outline" className="px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowRight className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-academic-primary to-academic-primary/80 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold">UNI-TEL</p>
                <p className="text-xs text-muted-foreground">Academic Hub</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 UNI-TEL. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Empowering students worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


