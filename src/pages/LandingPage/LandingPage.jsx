import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Verified, Timer, BarChart4, Trophy, 
  Smartphone, BookOpen, Users, Compass 
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    { 
      title: 'Adaptive UI', 
      desc: 'A seamless testing interface that adjusts to any device, ensuring you can practice anywhere, anytime.', 
      icon: Smartphone, 
      color: 'text-primary bg-primary/10' 
    },
    { 
      title: 'Deep Analytics', 
      desc: 'Identify weak areas with item-level analysis and comprehensive performance heatmaps.', 
      icon: BarChart4, 
      color: 'text-secondary bg-secondary/10' 
    },
    { 
      title: 'Previous Papers', 
      desc: 'Access a vast library of authentic past questions with detailed step-by-step video solutions.', 
      icon: BookOpen, 
      color: 'text-tertiary bg-tertiary/10' 
    },
    { 
      title: 'Global Ranking', 
      desc: 'Benchmark your preparation against thousands of aspirants nationwide with real-time leaderboards.', 
      icon: Users, 
      color: 'text-primary-fixed-dim bg-primary/10' 
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-12 grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center min-h-[calc(100vh-80px)]">
        {/* Left Content */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/20 text-secondary border border-secondary-container/30 rounded-full w-fit">
            <Verified className="w-4 h-4" />
            <span className="font-small text-xs font-semibold">New: Simulated NEET & JEE Modules</span>
          </div>
          <h1 className="font-h1 text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight tracking-tight">
            Practice Like the <br className="hidden md:inline" />
            <span className="text-primary dark:text-primary-fixed">Real Exam.</span>
          </h1>
          <p className="font-body text-base md:text-lg text-on-surface-variant max-w-[540px] leading-relaxed">
            Master your examinations with high-fidelity simulations that mirror the exact environment, difficulty, and pressure of the actual day. Gain data-driven insights to crush your score goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
              Start Free Test
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/tests')}
            >
              Explore Tests
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex -space-x-3">
              <img 
                className="w-10 h-10 rounded-full border-2 border-surface object-cover bg-slate-200" 
                alt="Student 1" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnL0IQyP0yQyX5M5DZOFRMLzQusMmEQ_PDQUWfWzxASUBtBx9wp62eYkYJZRcNuQHQcWyD3BoYPx-cWFcfA2hJYj1ErmwoRynyh0BN_EfMCft6bCKpCtXFgLtsw-tFWS2lgJxoJBDeXWOdf5coSHoBJMr3rs2lDSf7huTFCqcQWli4EagHQo_vJE8imz260BecgWIBbg9fAZcyB5Mp6XtLWNu24KsfRKQ_96SoJnezGxkyjH0cKXlXjJgO2aMOpxY6SmoIlyYWUAo"
              />
              <img 
                className="w-10 h-10 rounded-full border-2 border-surface object-cover bg-slate-300" 
                alt="Student 2" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbS5AJ-DkxipechDq3M6MKUnyUXZfqRxuvlZXeZ_B6hRV5Z37WMMgFqv-M3r-47yPP15xA6Zw4ESghZSmi0Y-vpdnOdPRqYjyMLzEl9jcKlYc02kjAm8MP_hzTlRVcZJEWKWj2IHfH6JxUZ_iufDI1lLM0kNXCrQUdAbVNmWh6eeFwAiHfd1t6M87CIimW6JiDii3MLYaMMu6DxIZhfUBhTxIJPHkztUpNhR7rGwN43FTG-WwnkwYTXr1ez34jRQ2Ef6UNmL_Vd-o"
              />
              <img 
                className="w-10 h-10 rounded-full border-2 border-surface object-cover bg-slate-400" 
                alt="Student 3" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6yQ378Vx5SLoz_6yxjQDLsfszKoLkkjyERW-LDPyDQukJMjV15idYLkNCLxrNXyM9TjVeK4Zp6xJOmk4-jpuH-LCsaxHFdGgccaGAbuwxKlsxBFrKo7-Abka18l6EwwuJDMu3OFsa6R6reVI5i9Cd5nNoOatDx9MPY0__S6Fs5HYUc_5mSArpmpvoFceZu3YEQWTdut1rXgulbE1lGFWTpRg_pOLf04IOGh0eUqeW-6rC4SYB9y24ZpzDAsm6vWT_3MY8f389aDk"
              />
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">
              Joined by <span className="text-primary dark:text-primary-fixed font-bold">15,000+</span> students this week
            </p>
          </div>
        </div>

        {/* Right Content - Mockup Animation */}
        <div className="relative h-[550px] lg:h-[600px] flex items-center justify-center mt-12 lg:mt-0">
          <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] -z-10"></div>
          
          <Card className="relative w-full max-w-[480px] aspect-[4/3] rounded-3xl border border-white/40 p-6 flex flex-col shadow-2xl">
            {/* Header circles */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              </div>
              <div className="h-2 w-32 bg-surface-container dark:bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 pulse-soft"></div>
              </div>
            </div>

            {/* Skeleton Stem */}
            <div className="space-y-4 flex-grow">
              <div className="h-4 w-3/4 bg-surface-variant/40 dark:bg-surface-variant/20 rounded-lg"></div>
              <div className="h-4 w-full bg-surface-variant/40 dark:bg-surface-variant/20 rounded-lg"></div>
              
              {/* Dummy Options */}
              <div className="grid grid-cols-1 gap-3 mt-8">
                <div className="h-12 w-full border-2 border-primary/20 rounded-xl bg-primary/5 flex items-center px-4">
                  <div className="w-5 h-5 rounded-full border-2 border-primary mr-3 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  </div>
                  <div className="h-3 w-1/2 bg-primary/20 rounded"></div>
                </div>
                <div className="h-12 w-full border border-outline-variant/30 dark:border-outline-variant/10 rounded-xl flex items-center px-4 bg-surface/50">
                  <div className="w-5 h-5 rounded-full border border-outline-variant/50 mr-3"></div>
                  <div className="h-3 w-1/3 bg-outline-variant/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Floating Indicators */}
            {/* Live Timer */}
            <div className="absolute -top-6 -right-6 floating-animation glass-card p-4 rounded-2xl shadow-lg border border-primary/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Time Left</p>
                <p className="text-base font-bold text-on-surface font-mono tabular-nums">00:42:15</p>
              </div>
            </div>

            {/* Accuracy */}
            <div className="absolute top-1/3 -left-10 floating-animation [animation-delay:0.5s] glass-card p-4 rounded-2xl shadow-lg border border-secondary/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                <BarChart4 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Accuracy</p>
                <p className="text-base font-bold text-secondary">94%</p>
              </div>
            </div>

            {/* Velocity */}
            <div className="absolute bottom-10 -right-8 floating-animation [animation-delay:1s] glass-card p-4 rounded-2xl shadow-lg border border-primary/20 flex flex-col gap-2 min-w-[150px]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant">Velocity</span>
                <span className="text-xs font-bold text-primary dark:text-primary-fixed">High</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container dark:bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-4/5"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant italic">Top 5% speed today</p>
            </div>

            {/* Global Rank */}
            <div className="absolute -bottom-8 left-1/4 floating-animation [animation-delay:1.5s] glass-card px-6 py-3 rounded-full shadow-xl border border-tertiary/20 flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-tertiary" />
              <span className="font-button text-xs text-on-surface">
                New Global Rank: <span className="text-tertiary font-extrabold">#12</span>
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="bg-surface-container-low dark:bg-surface-dim/40 py-24 md:py-32 border-y border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-h2 text-3xl md:text-4xl font-bold text-on-surface">Built for Academic Excellence</h2>
            <p className="font-body text-base text-on-surface-variant max-w-[650px] mx-auto leading-relaxed">
              We've engineered every feature to reduce anxiety and increase performance, giving you the competitive edge you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card 
                  key={idx} 
                  variant="glass"
                  className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-outline-variant/20"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feat.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-h4 text-lg font-bold text-on-surface mb-3">{feat.title}</h4>
                  <p className="font-small text-xs md:text-sm text-on-surface-variant leading-relaxed">
                    {feat.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-24">
        <div className="bg-primary-container text-on-primary-container rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="relative z-10 max-w-[750px] mx-auto space-y-8">
            <h2 className="font-h1 text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to Ace Your Exams?
            </h2>
            <p className="font-body text-base md:text-lg text-white/80">
              Join 500,000+ students already using ExamPro to transform their study habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full h-12 px-6 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/25 transition-all text-sm"
              />
              <Button 
                variant="solid" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-slate-100 flex-shrink-0 font-bold"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
