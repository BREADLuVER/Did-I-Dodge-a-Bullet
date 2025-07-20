'use client';

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { RedFlag, redFlagsService } from '@/lib/redFlags';
import { Building2, Users, TrendingUp, Heart, FileText, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react';
import { Company } from '@/lib/companyUtils';

// Lazy load heavy components
const CompanyPage = lazy(() => import('./CompanyPage'));
const CompanyInput = lazy(() => import('./CompanyInput'));

// Types
interface InterviewCheckupProps {
  markedFlags: Set<string>;
  onToggleFlag: (flagId: string) => void;
  onNewCheckup?: () => void;
}

interface RedFlagCardProps {
  redFlag: RedFlag;
  isMarked: boolean;
  onToggle: () => void;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
  </div>
);

// Utility functions - now handled by RedFlagsService

const getCategoryBreakdown = (markedFlags: Set<string>, allFlags: RedFlag[]) => {
  const markedFlagObjects = allFlags.filter(flag => markedFlags.has(flag.id));
  const categories = markedFlagObjects.map(flag => flag.category);
  const categoryCount = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));
};

// Bingo detection logic
const checkBingo = (markedFlags: Set<string>, curatedFlags: RedFlag[]): number[][] => {
  const lines: number[][] = [];
  const size = 3;

  // Check rows
  for (let row = 0; row < size; row++) {
    const rowSquares = Array.from({ length: size }, (_, col) => row * size + col);
    if (rowSquares.every(square => markedFlags.has(curatedFlags[square]?.id))) {
      lines.push(rowSquares);
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    const colSquares = Array.from({ length: size }, (_, row) => row * size + col);
    if (colSquares.every(square => markedFlags.has(curatedFlags[square]?.id))) {
      lines.push(colSquares);
    }
  }

  // Check diagonals
  const diagonal1 = [0, 4, 8]; // Top-left to bottom-right
  if (diagonal1.every(square => markedFlags.has(curatedFlags[square]?.id))) {
    lines.push(diagonal1);
  }

  const diagonal2 = [2, 4, 6]; // Top-right to bottom-left
  if (diagonal2.every(square => markedFlags.has(curatedFlags[square]?.id))) {
    lines.push(diagonal2);
  }

  return lines;
};

// Optimized Red Flag Card Component
const RedFlagCard = React.memo(({ redFlag, isMarked, onToggle }: RedFlagCardProps) => {
  const handleClick = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  const getSeverityColor = useMemo(() => {
    switch (redFlag.severity) {
      case 'medium':
        return 'border-orange-500 bg-white';
      case 'light':
        return 'border-yellow-500 bg-white';
      default:
        return 'border-gray-300 bg-white';
    }
  }, [redFlag.severity]);

  return (
    <div
      className={`p-2 sm:p-3 md:p-4 rounded-lg border-2 text-xs sm:text-sm font-medium text-center flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] md:min-h-[120px] transition-all duration-200 ${
        isMarked
          ? 'border-red-500 bg-red-500 text-white shadow-lg'
          : `${getSeverityColor} hover:border-red-500 hover:bg-gray-50 cursor-pointer`
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${isMarked ? 'Unmark' : 'Mark'} red flag: ${redFlag.text}`}
      aria-pressed={isMarked}
    >
      <p className="leading-tight text-xs sm:text-sm">{redFlag.text}</p>
    </div>
  );
});

RedFlagCard.displayName = 'RedFlagCard';

// Quick Checkup Component
const QuickCheckup = React.memo(({ 
  curatedFlags, 
  markedFlags, 
  onToggleFlag, 
  onSubmitResults, 
  onRerollBoard,
  onBack,
  companyName 
}: {
  curatedFlags: RedFlag[];
  markedFlags: Set<string>;
  onToggleFlag: (flagId: string) => void;
  onSubmitResults: () => void;
  onRerollBoard: () => void;
  onBack: () => void;
  companyName?: string | null;
}) => {
  const bingoLines = useMemo(() => checkBingo(markedFlags, curatedFlags), [markedFlags, curatedFlags]);
  const bingoCount = bingoLines.length;

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Back Button */}
      <div className="flex justify-start px-2 sm:px-0">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-xs sm:text-sm font-medium">Change Company</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center px-2 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
          Quick Checkup
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4">
          Just finished an interview?<br />
          Mark the red flags that stood out to you.
        </p>
        {companyName && (
          <p className="text-xs sm:text-sm text-orange-600">
            Analyzing patterns for: <span className="font-semibold">{companyName}</span>
          </p>
        )}
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
          {curatedFlags.filter(flag => markedFlags.has(flag.id)).length} of 9 selected
        </div>
      </div>

      {/* Bingo Notification */}
      {bingoCount > 0 && (
        <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 sm:p-6 text-center mx-2 sm:mx-0">
          <div className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
            🚨 BINGO! 🚨
          </div>
          <div className="text-sm sm:text-base text-red-600">
            You&apos;ve marked {bingoCount} complete line{bingoCount > 1 ? 's' : ''} of red flags.
            <br />
            <strong>This is a major warning sign!</strong>
          </div>
        </div>
      )}

      {/* Bingo Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto px-2 sm:px-0">
        {curatedFlags.map((flag, index) => (
          <RedFlagCard
            key={flag.id}
            redFlag={flag}
            isMarked={markedFlags.has(flag.id)}
            onToggle={() => onToggleFlag(flag.id)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2 sm:px-0">
        <button
          onClick={onSubmitResults}
          disabled={curatedFlags.filter(flag => markedFlags.has(flag.id)).length === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
        >
          Get My Results
        </button>
        <button
          onClick={onRerollBoard}
          className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
        >
          New Board
        </button>
      </div>
    </div>
  );
});

QuickCheckup.displayName = 'QuickCheckup';

// Results Feedback Component
const ResultsFeedback = React.memo(({ 
  markedFlags, 
  redFlags, 
  companyName, 
  companyId,
  onViewCompanyPage, 
  onExploreMoreFlags, 
  onNewCheckup
}: {
  markedFlags: Set<string>;
  redFlags: RedFlag[]; // This is now curatedFlags from the current board
  companyName?: string | null;
  companyId?: string | null;
  onViewCompanyPage: () => void;
  onExploreMoreFlags: () => void;
  onNewCheckup?: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const markedFlagObjects = useMemo(() => 
    redFlags.filter(flag => markedFlags.has(flag.id)), 
    [markedFlags, redFlags]
  );
  
  const categoryBreakdown = useMemo(() => 
    getCategoryBreakdown(markedFlags, redFlags), 
    [markedFlags, redFlags]
  );

  const severityBreakdown = useMemo(() => {
    const light = markedFlagObjects.filter(flag => flag.severity === 'light').length;
    const medium = markedFlagObjects.filter(flag => flag.severity === 'medium').length;
    return { light, medium };
  }, [markedFlagObjects]);

  // Submit results to backend
  const submitResults = useCallback(async () => {
    if (isSubmitting || submissionStatus === 'success') return;
    
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyName || null,
          companyId: companyId || null,
          markedFlags: Array.from(markedFlags),
          totalFlags: markedFlagObjects.length,
          severityBreakdown,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit results');
      }

      const result = await response.json();
      if (result.success) {
        setSubmissionStatus('success');
        console.log('✅ Results submitted successfully:', result);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Error submitting results:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, submissionStatus, companyName, companyId, markedFlags, severityBreakdown, markedFlagObjects.length]);

  // Auto-submit results when component mounts
  useEffect(() => {
    submitResults();
  }, [submitResults]);

  const handleDownloadResults = useCallback(() => {
    const content = `Interview Red Flag Checkup Results

Company: ${companyName || 'Not specified'}
Date: ${new Date().toLocaleDateString()}

Total Red Flags Marked: ${markedFlagObjects.length}

Severity Breakdown:
- Light Flags: ${severityBreakdown.light}
- Medium Flags: ${severityBreakdown.medium}

Top Categories:
${categoryBreakdown.map(cat => `- ${cat.category}: ${cat.count}`).join('\n')}

Marked Red Flags:
${markedFlagObjects.map(flag => `• ${flag.text} (${flag.severity})`).join('\n')}

${severityBreakdown.medium > 0 ? '⚠️  You marked medium-severity flags. Consider these carefully.' : ''}
${markedFlagObjects.length >= 5 ? '🚨  High number of red flags detected. Proceed with caution.' : ''}

Trust your instincts. You deserve better.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-checkup-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markedFlagObjects, companyName, severityBreakdown, categoryBreakdown]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Your Interview Checkup Results
        </h2>
        <p className="text-xl text-gray-600">
          Here&apos;s what your gut was telling you:
        </p>
        
        {/* Submission Status */}
        {isSubmitting && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-blue-700">Submitting your results...</span>
            </div>
          </div>
        )}
        
        {submissionStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-700">✅ Results submitted successfully!</span>
            </div>
          </div>
        )}
        
        {submissionStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-red-700">❌ Failed to submit results. Your data is saved locally.</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-red-500 mb-2">{markedFlagObjects.length}</div>
          <div className="text-gray-600">Red Flags Marked</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-orange-500 mb-2">{severityBreakdown.medium}</div>
          <div className="text-gray-600">Medium Severity</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-yellow-500 mb-2">{severityBreakdown.light}</div>
          <div className="text-gray-600">Light Severity</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {categoryBreakdown.map(({ category, count }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{category}</span>
                <span className="font-semibold text-orange-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marked Flags List */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Marked Red Flags</h3>
        <div className="space-y-3">
          {markedFlagObjects.map(flag => (
            <div key={flag.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                flag.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
              }`}></div>
              <div>
                <p className="text-gray-800 font-medium">{flag.text}</p>
                <p className="text-sm text-gray-600 capitalize">{flag.category} • {flag.severity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={handleDownloadResults}
          className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Download Results
        </button>
        {companyName && (
          <button
            onClick={onViewCompanyPage}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View Company Insights
          </button>
        )}
        <button
          onClick={onExploreMoreFlags}
          className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Explore All Flags
        </button>
        {onNewCheckup && (
          <button
            onClick={onNewCheckup}
            className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            New Checkup
          </button>
        )}
      </div>
    </div>
  );
});

ResultsFeedback.displayName = 'ResultsFeedback';

// Deep Dive Component
const DeepDive = React.memo(({ 
  redFlags, 
  onBackToResults 
}: { 
  redFlags: RedFlag[];
  onBackToResults: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const categories = useMemo(() => 
    Array.from(new Set(redFlags.map(flag => flag.category))).sort(), 
    [redFlags]
  );

  const filteredFlags = useMemo(() => 
    redFlags.filter(flag => {
      const categoryMatch = selectedCategory === 'all' || flag.category === selectedCategory;
      const severityMatch = selectedSeverity === 'all' || flag.severity === selectedSeverity;
      return categoryMatch && severityMatch;
    }), 
    [redFlags, selectedCategory, selectedSeverity]
  );

  const getCategoryColor = useCallback((category: string) => {
    const colors: Record<string, string> = {
      culture: 'bg-blue-100 text-blue-800',
      leadership: 'bg-purple-100 text-purple-800',
      role: 'bg-green-100 text-green-800',
      process: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-red-100 text-red-800',
      compensation: 'bg-indigo-100 text-indigo-800',
      stability: 'bg-pink-100 text-pink-800',
      environment: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }, []);

  const getSeverityColor = useCallback((severity: string) => {
    return severity === 'medium' ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50';
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">All Red Flags</h2>
          <p className="text-gray-600">Browse and learn about all available red flags</p>
        </div>
        <button
          onClick={onBackToResults}
          className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Severities</option>
          <option value="light">Light</option>
          <option value="medium">Medium</option>
        </select>
      </div>

      {/* Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlags.map(flag => (
          <div key={flag.id} className={`border-2 rounded-lg p-4 ${getSeverityColor(flag.severity)}`}>
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(flag.category)}`}>
                {flag.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                flag.severity === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {flag.severity}
              </span>
            </div>
            <p className="text-gray-800 font-medium mb-2">{flag.text}</p>
            {flag.explanation && (
              <p className="text-sm text-gray-600">{flag.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No flags match your current filters.</p>
        </div>
      )}
    </div>
  );
});

DeepDive.displayName = 'DeepDive';

// Step Indicator Component
const StepIndicator = ({ 
  currentStep, 
  onStepClick 
}: { 
  currentStep: string;
  onStepClick?: (stepId: string) => void;
}) => {
  const steps = [
    { id: 'company-input', label: 'Company', icon: '🏢' },
    { id: 'checkup', label: 'Checkup', icon: '🎯' },
    { id: 'feedback', label: 'Results', icon: '📊' },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  const handleStepClick = (stepId: string, stepIndex: number) => {
    // Only allow navigation to completed steps or current step
    if (stepIndex <= currentIndex && onStepClick) {
      onStepClick(stepId);
    }
  };

  const isStepClickable = (stepIndex: number) => {
    return stepIndex <= currentIndex && onStepClick;
  };

  return (
    <div className="hidden sm:flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepClick(step.id, index)}
              disabled={!isStepClickable(index)}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                index <= currentIndex 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              } ${
                isStepClickable(index) 
                  ? 'hover:scale-110 hover:shadow-lg cursor-pointer' 
                  : 'cursor-default'
              } ${
                step.id === currentStep ? 'ring-2 ring-orange-300 ring-offset-2' : ''
              }`}
              aria-label={`Go to ${step.label} step`}
            >
              {step.icon}
            </button>
            <span className={`ml-2 text-sm font-medium ${
              index <= currentIndex ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-orange-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main InterviewCheckup Component
export const InterviewCheckup = ({ markedFlags, onToggleFlag, onNewCheckup }: InterviewCheckupProps) => {
  const [step, setStep] = useState<'company-input' | 'checkup' | 'feedback' | 'deep-dive' | 'company'>('checkup');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyInput, setShowCompanyInput] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [curatedFlags, setCuratedFlags] = useState<RedFlag[]>([]);
  const [allRedFlags, setAllRedFlags] = useState<RedFlag[]>([]);
  const [isLoadingFlags, setIsLoadingFlags] = useState(true);

  // Load curated flags from Firebase
  useEffect(() => {
    const loadFlags = async () => {
      try {
        setIsLoadingFlags(true);
        const [curated, allFlags] = await Promise.all([
          redFlagsService.getCuratedFlags(9),
          redFlagsService.getAllRedFlags()
        ]);
        setCuratedFlags(curated);
        setAllRedFlags(allFlags);
      } catch (error) {
        console.error('Error loading red flags:', error);
        // Fallback to empty arrays
        setCuratedFlags([]);
        setAllRedFlags([]);
      } finally {
        setIsLoadingFlags(false);
      }
    };

    loadFlags();
  }, []);

  // Persist state in localStorage
  const persistState = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  }, []);

  const updateStep = useCallback((newStep: 'company-input' | 'checkup' | 'feedback' | 'deep-dive' | 'company') => {
    setStep(newStep);
    persistState('checkupStep', newStep);
  }, [persistState]);

  const updateSelectedCompany = useCallback((company: Company | null) => {
    setSelectedCompany(company);
    persistState('selectedCompany', company);
  }, [persistState]);

  const updateShowCompanyInput = useCallback((show: boolean) => {
    setShowCompanyInput(show);
    persistState('showCompanyInput', show);
  }, [persistState]);

  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem('checkupStep');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('showCompanyInput');
      localStorage.removeItem('sessionDismissed');
    } catch (error) {
      console.error('Error clearing persisted state:', error);
    }
  }, []);

  // Load persisted state on mount - but don't auto-restore step
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('checkupStep');
      const savedCompany = localStorage.getItem('selectedCompany');
      const savedShowInput = localStorage.getItem('showCompanyInput');
      const sessionDismissed = localStorage.getItem('sessionDismissed');

      // Don't show session restore if user has dismissed it
      if (sessionDismissed === 'true') {
        return;
      }

      // Validate and clean up any invalid step data
      if (savedStep) {
        try {
          const parsedStep = JSON.parse(savedStep);
          const validSteps = ['company-input', 'checkup', 'feedback', 'deep-dive', 'company'];
          if (!validSteps.includes(parsedStep)) {
            localStorage.removeItem('checkupStep');
          } else {
            // DON'T auto-restore the step - let user choose
            // Only show session restore notification if there are marked flags to restore
            const savedMarkedFlags = localStorage.getItem('markedFlags');
            if (savedMarkedFlags && markedFlags.size === 0) {
              setHasSavedSession(true);
            }
          }
        } catch (error) {
          localStorage.removeItem('checkupStep');
        }
      }

      // Restore company and showInput state (but don't auto-show company input)
      if (savedCompany) {
        setSelectedCompany(JSON.parse(savedCompany));
      }
      // Don't auto-restore showCompanyInput - let user choose when to show it
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }, [markedFlags.size]);

  const handleCompanySubmit = useCallback((company: Company | null) => {
    updateSelectedCompany(company);
    updateShowCompanyInput(false);
    updateStep('checkup');
  }, [updateSelectedCompany, updateShowCompanyInput, updateStep]);

  const handleSkipCompany = useCallback(() => {
    updateSelectedCompany(null);
    updateShowCompanyInput(false);
    updateStep('checkup');
  }, [updateSelectedCompany, updateShowCompanyInput, updateStep]);

  const handleStartCheckup = useCallback(() => {
    updateStep('checkup');
  }, [updateStep]);

  const handleSubmitResults = useCallback(async () => {
    updateStep('feedback');
  }, [updateStep]);

  const handleViewCompanyPage = useCallback(() => {
    updateStep('company');
  }, [updateStep]);

  const handleExploreMoreFlags = useCallback(() => {
    updateStep('deep-dive');
  }, [updateStep]);

  const handleBackToResults = useCallback(() => {
    updateStep('feedback');
  }, [updateStep]);

  const handleRerollBoard = useCallback(() => {
    // This will trigger a re-render with new curated flags
    window.location.reload();
  }, []); // No dependencies needed for reload

  const handleNewCheckup = useCallback(() => {
    clearPersistedState();
    setStep('company-input');
    setSelectedCompany(null);
    setShowCompanyInput(true);
    if (onNewCheckup) {
      onNewCheckup();
    }
  }, [clearPersistedState, onNewCheckup]);

  const handleBackFromCompany = useCallback(() => {
    updateStep('feedback');
  }, [updateStep]);

  const handleBackToCompanyInput = useCallback(() => {
    updateStep('company-input');
  }, [updateStep]);

  const handleRestoreSession = useCallback(() => {
    try {
      const savedStep = localStorage.getItem('checkupStep');
      if (savedStep) {
        const parsedStep = JSON.parse(savedStep);
        // Validate that the step is a valid value
        const validSteps = ['company-input', 'checkup', 'feedback', 'deep-dive', 'company'];
        if (validSteps.includes(parsedStep)) {
          setStep(parsedStep);
          setHasSavedSession(false);
        } else {
          // Clear the invalid step
          localStorage.removeItem('checkupStep');
          setHasSavedSession(false);
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }, []);

  const handleDismissSession = useCallback(() => {
    setHasSavedSession(false);
    
    // Get the current step before clearing
    const currentStep = localStorage.getItem('checkupStep');
    
    // Clear the saved session data
    clearPersistedState();
    // Also clear marked flags to prevent future session detection
    localStorage.removeItem('markedFlags');
    // Set a flag to prevent session restore from showing again
    localStorage.setItem('sessionDismissed', 'true');
    
    // If user was on company-input step, keep them there
    // Otherwise, reset to checkup step
    if (currentStep === '"company-input"') {
      setStep('company-input');
      setShowCompanyInput(true);
    } else {
      setStep('checkup');
    }
  }, [clearPersistedState]);

  // Handle step navigation from the indicator
  const handleStepNavigation = useCallback((stepId: string) => {
    // Validate the step transition
    const currentStepIndex = ['company-input', 'checkup', 'feedback'].indexOf(step);
    const targetStepIndex = ['company-input', 'checkup', 'feedback'].indexOf(stepId);
    
    // Only allow navigation to completed steps or current step
    if (targetStepIndex <= currentStepIndex) {
      updateStep(stepId as any);
    }
  }, [step, updateStep]);

  // Render based on current step
  switch (step) {
    case 'company-input':
      return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <StepIndicator currentStep="company-input" onStepClick={handleStepNavigation} />
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Company Selection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Let&apos;s start by entering the company name for your interview checkup.
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <CompanyInput
              onCompanySelect={handleCompanySubmit}
              onSkip={handleSkipCompany}
            />
          </Suspense>
        </div>
      );
    case 'checkup':
      return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <StepIndicator currentStep="checkup" onStepClick={handleStepNavigation} />
          
          {/* Saved Session Notification */}
          {hasSavedSession && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-blue-800 font-medium">Continue your previous session?</p>
                    <p className="text-blue-600 text-sm">You have an unfinished interview checkup.</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRestoreSession}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleDismissSession}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isLoadingFlags ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading red flags...</p>
              </div>
            </div>
          ) : (
            <QuickCheckup
              curatedFlags={curatedFlags}
              markedFlags={markedFlags}
              onToggleFlag={onToggleFlag}
              onSubmitResults={handleSubmitResults}
              onRerollBoard={handleRerollBoard}
              onBack={handleBackToCompanyInput}
              companyName={selectedCompany?.name}
            />
          )}
        </div>
      );
    case 'feedback':
      return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <StepIndicator currentStep="feedback" onStepClick={handleStepNavigation} />
          <ResultsFeedback
            markedFlags={markedFlags}
            redFlags={curatedFlags}
            companyName={selectedCompany?.name}
            companyId={selectedCompany?.id}
            onViewCompanyPage={handleViewCompanyPage}
            onExploreMoreFlags={handleExploreMoreFlags}
            onNewCheckup={handleNewCheckup}
          />
        </div>
      );
    case 'deep-dive':
      return (
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex items-center justify-between">
            <StepIndicator currentStep="feedback" onStepClick={handleStepNavigation} />
            <button
              onClick={handleBackToResults}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Results</span>
            </button>
          </div>
          <DeepDive
            redFlags={allRedFlags}
            onBackToResults={handleBackToResults}
          />
        </div>
      );
         case 'company':
       return selectedCompany ? (
         <div className="max-w-4xl mx-auto px-4 space-y-8">
           <div className="flex items-center justify-between">
             <StepIndicator currentStep="feedback" onStepClick={handleStepNavigation} />
             <button
               onClick={handleBackFromCompany}
               className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               <span>Back to Results</span>
             </button>
           </div>
           <Suspense fallback={<LoadingSpinner />}>
             <CompanyPage
               companyName={selectedCompany.name}
               onBack={handleBackFromCompany}
             />
           </Suspense>
         </div>
       ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Company not found.</p>
          <button
            onClick={handleBackFromCompany}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full"
          >
            Back to Results
          </button>
        </div>
      );
    default:
      // If we somehow get an invalid step, reset to checkup
      setStep('checkup');
      return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <StepIndicator currentStep="checkup" onStepClick={handleStepNavigation} />
          <QuickCheckup
            curatedFlags={curatedFlags}
            markedFlags={markedFlags}
            onToggleFlag={onToggleFlag}
            onSubmitResults={handleSubmitResults}
            onRerollBoard={handleRerollBoard}
            onBack={handleBackToCompanyInput}
            companyName={selectedCompany?.name}
          />
        </div>
      );
  }
}; 