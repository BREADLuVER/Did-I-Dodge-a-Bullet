import { NextRequest, NextResponse } from 'next/server';
import { submitInterviewCheckup, generateSessionId, hashIP } from '@/lib/firebase';
import { companyService } from '@/lib/companyUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, companyId, markedFlags, totalFlags, severityBreakdown } = body;

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    
    // Hash the IP for privacy
    const ipHash = await hashIP(ip);
    
    // Generate session ID
    const sessionId = generateSessionId();
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Submit to Firebase
    const submissionId = await submitInterviewCheckup({
      companyName,
      markedFlags,
      totalFlags,
      severityBreakdown,
      userAgent,
      ipHash,
      sessionId
    });

        // Update company with submission data
    if (companyId) {
      try {
        // Refresh companies to ensure we have the latest data
        await companyService.refreshCompanies();
        await companyService.updateCompanyWithSubmission(companyId, {
          markedFlags,
          severityBreakdown
        });
      } catch (error) {
        console.error('Error updating company:', error);
        // Don't fail the submission if company update fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      submissionId,
      sessionId 
    });

  } catch (error) {
    console.error('Error submitting interview checkup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit interview checkup' },
      { status: 500 }
    );
  }
} 