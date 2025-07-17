'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { companyService } from '@/lib/companyUtils';
import { RedFlag, redFlags } from '@/lib/redFlags';
import { Building2, Users, TrendingUp, Heart, FileText, BarChart3, ArrowLeft, Eye, AlertTriangle, Clock } from 'lucide-react';

interface CompanyPageProps {
  companyName: string;
  onBack: () => void;
}

const CompanyPage = ({ companyName, onBack }: CompanyPageProps) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Always refresh companies to get latest data
    companyService.refreshCompanies().then(() => {
      return companyService.searchCompanies(companyName, 1);
    }).then((results) => {
      setInsights(results[0] || null);
      setLoading(false);
    });
  }, [companyName]);

  // Get the 3 most common flags with their details
  const topFlags = useMemo(() => {
    if (!insights?.commonFlags || insights.commonFlags.length === 0) {
      return [];
    }

    // Count frequency of each flag
    const flagCounts = insights.commonFlags.reduce((acc: Record<string, number>, flagId: string) => {
      acc[flagId] = (acc[flagId] || 0) + 1;
      return acc;
    }, {});

    // Get flag details and sort by frequency
    const flagDetails = Object.entries(flagCounts)
      .map(([flagId, count]) => {
        const flag = redFlags.find(f => f.id === flagId);
        return flag ? { ...flag, count } : null;
      })
      .filter((f): f is RedFlag & { count: number } => Boolean(f))
      .sort((a, b) => (b?.count || 0) - (a?.count || 0))
      .slice(0, 3);

    return flagDetails;
  }, [insights]);

  // Format the last updated date properly
  const formatLastUpdated = (lastSubmission: any) => {
    if (!lastSubmission) return 'N/A';
    
    try {
      // Handle different date formats
      let date: Date;
      if (lastSubmission.seconds) {
        // Firestore timestamp
        date = new Date(lastSubmission.seconds * 1000);
      } else if (lastSubmission.toDate) {
        // Firestore timestamp object
        date = lastSubmission.toDate();
      } else if (typeof lastSubmission === 'string') {
        // ISO string
        date = new Date(lastSubmission);
      } else {
        // Try to parse as Date
        date = new Date(lastSubmission);
      }
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'light':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'light':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Results
      </button>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
          <Building2 className="w-7 h-7 text-orange-500 mr-3" />
          {companyName}
        </h2>
        
        {loading ? (
          <div className="text-gray-500 mt-4">Loading insights...</div>
        ) : insights ? (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {insights.submissionCount || 0}
                </div>
                <div className="text-sm text-blue-700">Checkups Submitted</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {insights.averageFlagCount?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-purple-700">Avg Flags per Checkup</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {insights.severityTrends?.medium || 0}
                </div>
                <div className="text-sm text-red-700">Medium Severity Flags</div>
              </div>
            </div>

            {/* Top 3 Most Common Flags */}
            {topFlags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 text-green-500 mr-2" />
                  Most Common Red Flags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topFlags.map((flag, index) => (
                    <div key={flag?.id} className={`border-2 rounded-lg p-4 ${getSeverityColor(flag?.severity || 'light')}`}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded">
                          #{index + 1} • {flag?.count} time{flag?.count !== 1 ? 's' : ''}
                        </span>
                        {getSeverityIcon(flag?.severity || 'light')}
                      </div>
                      <p className="text-gray-800 font-medium text-sm mb-2">
                        {flag?.text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="capitalize">{flag?.category}</span>
                        <span className="capitalize">{flag?.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Severity Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Severity Breakdown</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Light: {insights.severityTrends?.light || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Medium: {insights.severityTrends?.medium || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>
                Last updated: {formatLastUpdated(insights.lastSubmission)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 mt-4">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No insights available yet</h3>
              <p className="text-gray-500">
                Be the first to submit a checkup for {companyName}!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPage; 