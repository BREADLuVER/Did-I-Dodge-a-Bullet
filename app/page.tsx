'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { getBalancedRedFlags, RedFlag } from '@/lib/redFlags';
import { Target, AlertTriangle, Heart, RefreshCw, ChevronDown, Zap, Shield, Eye } from 'lucide-react';

// Lazy load heavy components
const InterviewCheckup = lazy(() => import('@/components/InterviewCheckup').then(mod => ({ default: mod.InterviewCheckup })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 border-b-2 border-orange-400"></div>
  </div>
);

export default function Home() {
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [markedFlags, setMarkedFlags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load red flags asynchronously
    const loadRedFlags = async () => {
      try {
        const flags = getBalancedRedFlags();
        setRedFlags(flags);
        
        // Load marked flags from localStorage on page load
        const savedMarkedFlags = localStorage.getItem('markedFlags');
        if (savedMarkedFlags) {
          try {
            const parsed = JSON.parse(savedMarkedFlags);
            setMarkedFlags(new Set(parsed));
          } catch (error) {
            console.error('Error loading marked flags from localStorage:', error);
          }
        }
      } catch (error) {
        console.error('Error loading red flags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRedFlags();
  }, []);

  const handleNewCheckup = () => {
    setRedFlags(getBalancedRedFlags());
    setMarkedFlags(new Set());
    localStorage.removeItem('markedFlags');
  };

  const handleFlagToggle = (flagId: string) => {
    const newMarked = new Set(markedFlags);
    if (newMarked.has(flagId)) {
      newMarked.delete(flagId);
    } else {
      newMarked.add(flagId);
    }
    setMarkedFlags(newMarked);
    
    // Save to localStorage
    localStorage.setItem('markedFlags', JSON.stringify(Array.from(newMarked)));
  };

  const handleScrollToCheckup = () => {
    document.getElementById('checkup-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-orange-500 rounded-full blur-2xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Icon Row */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6">
            Did I Dodge a <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Bullet?</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Post-interview red flag checkup for the <span className="font-semibold text-orange-600">quietly suspicious</span>. 
            Trust your gut instincts and process those interview vibes.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Research-backed flags</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Trust your instincts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Know your worth</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={handleScrollToCheckup}
              className="group bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-orange-500 hover:to-orange-600"
            >
              Start Your Interview Checkup
              <ChevronDown className="w-5 ml-2 inline-block group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Interview Checkup Section */}
      <section id="checkup-section" className="py-16 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <main className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <InterviewCheckup 
                redFlags={redFlags}
                markedFlags={markedFlags}
                onToggleFlag={handleFlagToggle}
                onNewCheckup={handleNewCheckup}
              />
            </Suspense>
          </main>

          {/* Footer */}
          <footer className="mt-16 text-center text-gray-500">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-4 h-4 text-orange-400" />
              <span className="text-sm">
                Trust your instincts. You deserve better.
              </span>
              <Heart className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xs">
              Built for job seekers who know their worth
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
} 