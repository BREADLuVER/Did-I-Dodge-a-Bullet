'use client';

import React, { useState, useEffect } from 'react';
import { RedFlag } from '@/lib/redFlags';
import { Building2, Users, TrendingUp, Heart, FileText, BarChart3 } from 'lucide-react';

// Types
interface InterviewCheckupProps {
  redFlags: RedFlag[];
  markedFlags: Set<string>;
  onToggleFlag: (flagId: string) => void;
  onNewCheckup?: () => void;
}

interface RedFlagCardProps {
  redFlag: RedFlag;
  isMarked: boolean;
  onToggle: () => void;
}

interface CompanyInputProps {
  onSubmit: (companyName: string) => void;
  onSkip: () => void;
}

// Utility functions
const getCuratedFlags = (allFlags: RedFlag[]): RedFlag[] => {
  const medium = allFlags.filter(flag => flag.severity === 'medium');
  const light = allFlags.filter(flag => flag.severity === 'light');

  // Strategic placement: 3 medium (corners + center), 6 light (edges + remaining positions)
  const selectedMedium = medium.slice(0, 3);
  const selectedLight = light.slice(0, 6);

  // Create a 3x3 grid with strategic placement
  const grid = [
    [selectedMedium[0], selectedLight[0], selectedMedium[1]], // Top row: medium, light, medium
    [selectedLight[1], selectedMedium[2], selectedLight[2]], // Middle row: light, medium, light
    [selectedLight[3], selectedLight[4], selectedLight[5]]   // Bottom row: all light
  ];

  // Flatten the grid and return
  return grid.flat();
};

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

// Red Flag Card Component
const RedFlagCard = ({ redFlag, isMarked, onToggle }: RedFlagCardProps) => {
  const handleClick = () => {
    onToggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  const getSeverityColor = () => {
    switch (redFlag.severity) {
      case 'medium':
        return 'border-yellow-500 bg-white';
      case 'light':
        return 'border-gray-400 bg-white';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div
              className={`p-4 rounded-lg border-2 text-sm font-medium text-center flex flex-col items-center justify-center min-h-[120px] transition-all duration-200 ${
          isMarked
            ? 'border-red-500 bg-red-500 text-white shadow-lg'
            : `${getSeverityColor()} hover:border-red-500 hover:bg-gray-50 cursor-pointer`
        }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${isMarked ? 'Unmark' : 'Mark'} red flag: ${redFlag.text}`}
      aria-pressed={isMarked}
    >
      <p className="leading-tight">{redFlag.text}</p>
      
      {isMarked && (
        <div className="mt-2 text-lg">
          🚩
        </div>
      )}
    </div>
  );
};

// Company Input Component
const CompanyInput = ({ onSubmit, onSkip }: CompanyInputProps) => {
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      onSubmit(companyName.trim());
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <Building2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">
            Enter company name to unlock:
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">Share your experience to others</span>
          </div>
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">See common red flags at this company</span>
          </div>
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">Help future candidates</span>
          </div>
          <div className="flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">Get company-specific insights</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 animate-pulse"
          >
            Start Checkup
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onSkip}
            className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105"
          >
            Skip for anonymous checkup
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Checkup Component
const QuickCheckup = ({ 
  curatedFlags, 
  markedFlags, 
  onToggleFlag, 
  onSubmitResults, 
  onRerollBoard,
  companyName 
}: {
  curatedFlags: RedFlag[];
  markedFlags: Set<string>;
  onToggleFlag: (flagId: string) => void;
  onSubmitResults: () => void;
  onRerollBoard: () => void;
  companyName?: string | null;
}) => {
  const bingoLines = checkBingo(markedFlags, curatedFlags);
  const bingoCount = bingoLines.length;

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 w-full">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Quick Checkup
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
          Just finished an interview?<br />
          Mark the red flags that stood out to you.
        </p>
        {companyName && (
          <p className="text-sm text-orange-600">
            Analyzing patterns for: <span className="font-semibold">{companyName}</span>
          </p>
        )}
        <div className="mt-4 text-sm text-gray-500">
          {markedFlags.size} of 9 selected
        </div>
      </div>

      {/* Bingo Notification */}
      {bingoCount > 0 && (
        <div className="text-center">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg inline-block animate-bounce">
            <span className="font-bold text-lg">BINGO! 🚩</span><br />
            <span className="text-sm">You might have dodged a bullet!</span>
          </div>
        </div>
      )}

      {/* 3x3 Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {curatedFlags.map((redFlag, index) => (
            <RedFlagCard
              key={redFlag.id}
              redFlag={redFlag}
              isMarked={markedFlags.has(redFlag.id)}
              onToggle={() => onToggleFlag(redFlag.id)}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-600">
          {bingoCount > 0 && (
            <span className="text-red-600 font-medium">
              {bingoCount} bingo line{bingoCount > 1 ? 's' : ''} found!
            </span>
          )}
        </div>
      </div>

              {/* Reroll Board Button */}
        <div className="flex justify-center">
          <button
            onClick={onRerollBoard}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Reroll Board
          </button>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onSubmitResults}
            disabled={markedFlags.size === 0}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Get Your Results
          </button>
        </div>
    </div>
  );
};

// Results Feedback Component
const ResultsFeedback = ({ 
  markedFlags, 
  redFlags, 
  companyName, 
  onDownloadResults, 
  onViewCompanyPage, 
  onExploreMoreFlags, 
  onWriteNotes, 
  onNewCheckup 
}: {
  markedFlags: Set<string>;
  redFlags: RedFlag[];
  companyName?: string | null;
  onDownloadResults: () => void;
  onViewCompanyPage: () => void;
  onExploreMoreFlags: () => void;
  onWriteNotes: () => void;
  onNewCheckup?: () => void;
}) => {
  const markedFlagObjects = redFlags.filter(flag => markedFlags.has(flag.id));
  const categoryBreakdown = getCategoryBreakdown(markedFlags, redFlags);
  const breakdown = {
    medium: markedFlagObjects.filter(flag => flag.severity === 'medium').length,
    light: markedFlagObjects.filter(flag => flag.severity === 'light').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 w-full">
      {/* Result Summary */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Your Checkup Results
        </h2>
        
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {markedFlags.size} flags marked
            </div>
            <div className="text-lg text-gray-600 mb-4">
              {categoryBreakdown.length > 0 && (
                <span>
                  Mostly around {categoryBreakdown.map(cat => cat.category).join(', ')}
                </span>
              )}
            </div>
            
            {/* Visual Feedback Bar */}
            <div className="flex justify-center space-x-1 mb-4">
              {Array.from({ length: breakdown.medium }, (_, i) => (
                <div key={`medium-${i}`} className="w-4 h-4 bg-yellow-500 rounded"></div>
              ))}
              {Array.from({ length: breakdown.light }, (_, i) => (
                <div key={`light-${i}`} className="w-4 h-4 bg-green-500 rounded"></div>
              ))}
            </div>

            {markedFlags.size > 0 && (
              <div className="text-sm text-red-600 font-medium">
                Trust your instincts. You deserve better.
              </div>
            )}
          </div>
        </div>

        {/* Severity Scale */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Did any of these feel like deal-breakers?
            </h3>
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Not really
              </button>
              <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                Some concerns
              </button>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Major red flags
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            What would you like to do next?
          </h3>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {companyName && (
              <button
                onClick={onViewCompanyPage}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>View company page</span>
              </button>
            )}
            
            <button
              onClick={onDownloadResults}
              className="flex items-center justify-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              <span>Save anonymously</span>
            </button>
            
            <button
              onClick={onExploreMoreFlags}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Explore more flags</span>
            </button>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onWriteNotes}
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Write notes to your future self</span>
            </button>
          </div>
        </div>

        {/* New Checkup Button */}
        {onNewCheckup && (
          <div className="pt-4">
            <button
              onClick={onNewCheckup}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start a new checkup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Deep Dive Component
const DeepDive = ({ onBackToResults }: { onBackToResults: () => void }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Explore More Flags
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Dive deeper into specific categories or see what others have flagged.
        </p>
      </div>

              {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
        {['culture', 'leadership', 'process', 'communication', 'compensation', 'stability'].map(category => (
          <button
            key={category}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors capitalize"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Placeholder for category-specific flags */}
      <div className="text-center text-gray-500 py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Category-specific flags coming soon!</p>
      </div>

      {/* Back to Results */}
      <div className="flex justify-center">
        <button
          onClick={onBackToResults}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to your results
        </button>
      </div>
    </div>
  );
};

// Main InterviewCheckup Component
export const InterviewCheckup = ({ redFlags, markedFlags, onToggleFlag, onNewCheckup }: InterviewCheckupProps) => {
  const [showCompanyInput, setShowCompanyInput] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [step, setStep] = useState<'checkup' | 'feedback' | 'deep-dive'>('checkup');
  const [curatedFlags, setCuratedFlags] = useState<RedFlag[]>([]);

  // Initialize curated flags only once when component mounts or redFlags change
  useEffect(() => {
    setCuratedFlags(getCuratedFlags(redFlags));
  }, [redFlags]);

  // Event handlers
  const handleCompanySubmit = (name: string) => {
    setCompanyName(name);
    setShowCompanyInput(false);
  };

  const handleSkipCompany = () => {
    setShowCompanyInput(false);
  };

  const handleSubmitResults = () => {
    setStep('feedback');
  };

  const handleDownloadResults = () => {
    const markedFlagObjects = redFlags.filter(flag => markedFlags.has(flag.id));
    const breakdown = {
      medium: markedFlagObjects.filter(flag => flag.severity === 'medium').length,
      light: markedFlagObjects.filter(flag => flag.severity === 'light').length,
    };
    
    const content = `
INTERVIEW CHECKUP RESULTS

Marked ${markedFlags.size} out of 9 red flags
${companyName ? `Company: ${companyName}` : 'Anonymous submission'}

SEVERITY BREAKDOWN:
- Medium Red Flags: ${breakdown.medium}
- Light Red Flags: ${breakdown.light}

RED FLAGS YOU IDENTIFIED:
${markedFlagObjects.map((flag, index) => `${index + 1}. ${flag.text}`).join('\n')}

Generated at: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-checkup-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewCompanyPage = () => {
    alert('Company page coming soon!');
  };

  const handleExploreMoreFlags = () => {
    setStep('deep-dive');
  };

  const handleWriteNotes = () => {
    alert('Reflection journal coming soon!');
  };

  const handleBackToResults = () => {
    setStep('feedback');
  };

  const handleRerollBoard = () => {
    setCuratedFlags(getCuratedFlags(redFlags));
  };

  // Render based on current step
  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 w-full">
      {/* Company Input Gate */}
      {showCompanyInput && (
        <CompanyInput onSubmit={handleCompanySubmit} onSkip={handleSkipCompany} />
      )}

      {/* Overlay Message (when company input is shown) */}
      {showCompanyInput && (
        <div className="relative">
          <div className="pointer-events-none">
            <QuickCheckup
              curatedFlags={curatedFlags}
              markedFlags={markedFlags}
              onToggleFlag={onToggleFlag}
              onSubmitResults={handleSubmitResults}
              onRerollBoard={handleRerollBoard}
              companyName={companyName}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg max-w-md mx-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Enter company name or skip to start
              </h3>
              <p className="text-gray-600">
                Your interview checkup is ready to begin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      {step === 'checkup' && !showCompanyInput && (
        <QuickCheckup
          curatedFlags={curatedFlags}
          markedFlags={markedFlags}
          onToggleFlag={onToggleFlag}
          onSubmitResults={handleSubmitResults}
          onRerollBoard={handleRerollBoard}
          companyName={companyName}
        />
      )}

      {step === 'feedback' && (
        <ResultsFeedback
          markedFlags={markedFlags}
          redFlags={redFlags}
          companyName={companyName}
          onDownloadResults={handleDownloadResults}
          onViewCompanyPage={handleViewCompanyPage}
          onExploreMoreFlags={handleExploreMoreFlags}
          onWriteNotes={handleWriteNotes}
          onNewCheckup={onNewCheckup}
        />
      )}

      {step === 'deep-dive' && (
        <DeepDive onBackToResults={handleBackToResults} />
      )}
    </div>
  );
}; 