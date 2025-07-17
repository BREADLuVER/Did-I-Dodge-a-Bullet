# Interview Checkup Tool - Workflow & Implementation Guide

## 🎯 Overview
Transition from rigid "Bingogame to flexible Interview Checkup" tool - a post-interview reflection and red flag identification system.

## 🔄 Core Changes

### **From Bingo Grid → Flexible Scroll**
- **Remove**: 3x3 rigid grid layout
- **Add**: Single column (mobile) / 2-3n (desktop) scrollable layout
- **Randomize**: All flags mixed together, no category grouping
- **Subtle Severity Coding**: Visual distinction without labels

### **From Game Mechanics → Reflection Tool**
- **Remove**: Bingo line detection, win conditions
- **Add**: Personal insights, company-specific data
- **Focus**: Self-reflection and awareness over "winning"

## 🏗 UI/UX Changes

### **1Remove Elements**
- [ ] Bingo grid layout
- [ ] Severity labels (Light", Medium", Heavy") on cards
- [ ] Share button functionality
- [ ] Bingo line detection and celebration
- [ ] Grid-based card positioning

### **2. Add Elements**
- [ ] Company name input section (below hero)
- ] Submit button (replaces share)
- [ ] Randomized flag display
- [ ] Company-specific insights
- [ ] Anonymous submission flow

### **3Modify Elements**
- [ ] Card interaction: Remove `text-white` on marked cards → use `text-black`
- [ ] Card layout: Larger, more readable, better spacing
- [ ] Severity coding: Subtle color differences only (no labels)
-  ] Action buttons: Focus on submit, remove share

## 🔥 Firebase/Supabase Integration

### **Database Schema**
```typescript
// Anonymous submissions (no sign-in required)
interface InterviewSubmission {
  id: string;
  companyName?: string; // Optional
  markedFlags: string[]; // Array of flag IDs
  totalFlags: number;
  severityBreakdown: {
    light: number;
    medium: number;
    heavy: number;
  };
  timestamp: Date;
  userAgent?: string;
  ipHash?: string; // Hashed for basic deduplication
}

// Company aggregations
interface CompanyInsights {
  companyName: string;
  totalSubmissions: number;
  commonFlags: string[];
  averageFlagCount: number;
  severityTrends: {
    light: number;
    medium: number;
    heavy: number;
  };
  lastUpdated: Date;
}
```

### **Collections/Tables**
- `submissions` - Individual interview checkups
- `company_insights` - Aggregated company data
- `flag_analytics` - Overall flag usage statistics

## 🏢 Company Name Strategy

### **Incentivization**
- **Without company**: Basic personal insights only
- **With company**: 
  - Compare to others at same company
  - See common red flags patterns
  - Help future candidates
  - Community impact feedback

### **Normalization & Matching**
```typescript
const normalizeCompanyName = (input: string): string =>[object Object]  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, )
    .replace(/[^\w\s-]/g,)
    .replace(/\b(inc|corp|llc|ltd|co|company)\b/g,)
    .trim();
};
```

### **Fuzzy Matching**
- 80% similarity threshold
- Common aliases database
- Auto-suggestions for existing companies
- Allow new company creation

## 🔄 User Journey Flow

### **Step 1: Landing**
- Hero explains the tool
- Cards visible but disabled (grayed out)
- Clear value prop for company input

### **Step 2: Company Input Gate**
```
┌─────────────────────────────────────┐
│ Enter company name to unlock:       │
│ • Compare your experience to others │
│ • See common red flags at [Company] │
│ • Help future candidates            │
│ • Get company-specific insights     │
│                                     │
│ [Company Name Input] Start Checkup] │
│                                     │
│ Skip for anonymous checkup          │
└─────────────────────────────────────┘
```

### **Step 3: Flag Interaction**
- Section slides up and disappears
- Cards become fully interactive
- Randomized display with subtle severity coding
- Natural scrolling experience

### **Step 4Review & Submit**
```
┌─────────────────────────────────────┐
│ You marked 7 out of 30                   │
│ Most concerning: Leadership gaps    │
│                                     │
│ [Submit Results] [Save Locally]     │
└─────────────────────────────────────┘
```

### **Step 5: Results & Insights**
- Personalized summary
- Company-specific context (if provided)
- Community impact feedback
- Option to save results locally

## 🛠 Technical Implementation

### **Component Updates**
-  ] `BingoBoard.tsx` → `InterviewCheckup.tsx`
- [ ] Remove bingo logic, add submission logic
- [ ] Add company input component
- [ ] Add submit button component
- [ ] Update card styling and interaction

### **Database Functions**
```typescript
const submitInterviewCheckup = async (data: InterviewSubmission) => {
  // Store submission
  await db.collection(submissions).add(data);
  
  // Update company insights
  if (data.companyName) {
    await updateCompanyInsights(data.companyName, data);
  }
  
  // Update flag analytics
  await updateFlagAnalytics(data.markedFlags);
};

const getCompanyInsights = async (companyName: string) => {
  return await db.collection('company_insights')
    .where(companyName',==', companyName)
    .get();
};
```

### **Company Name Processing**
```typescript
const processCompanyName = async (userInput: string) => {
  const normalized = normalizeCompanyName(userInput);
  
  // Check for exact match
  let company = await findCompanyByNormalizedName(normalized);
  
  if (!company) [object Object]  // Check aliases and fuzzy matches
    company = await findCompanyByAlias(normalized) || 
              await findSimilarCompanies(normalized);
  }
  
  if (!company) {
    // Create new company
    company = await createNewCompany(userInput, normalized);
  }
  
  return { type:match company, originalInput: userInput };
};
```

## 📊 Data Collection Strategy

### **Anonymous by Default**
- No sign-in required
- No personal data collected
- IP hashing for basic deduplication
- User agent for analytics

### **Privacy-First**
- Individual responses stay private
- Only aggregate patterns visible
- Company insights from multiple submissions

### **Community Building**
- Anonymous pattern sharing
- Company-specific insights
- Industry comparisons

## 🎯 Success Metrics

### **User Engagement**
- Completion rate (start to submit)
- Company name input rate
- Return usage

### **Data Quality**
- Company name accuracy
- Flag marking patterns
- Submission volume

### **Community Impact**
- Companies in database
- Insights generated
- User feedback

## 🚀 Implementation Phases

### **Phase 1: Core Restructure**
- [ ] Remove bingo grid
- [ ] Implement scrollable layout
- [ ] Add company input gate
- [ ] Basic submit functionality

### **Phase 2: Database Integration**
- [ ] Firebase/Supabase setup
- [ ] Company name processing
- [ ] Submission storage
- [ ] Basic analytics

### **Phase 3: Enhanced Insights**
- [ ] Company-specific insights
- unity data display
- [ ] Advanced analytics
-edback integration

## 🔧 File Changes Required

### **Components**
- `components/BingoBoard.tsx` → `components/InterviewCheckup.tsx`
- New: `components/CompanyInput.tsx`
- New: `components/SubmitButton.tsx`
- Update: `components/RedFlagCard.tsx`

### **Lib**
- New: `lib/database.ts`
- New: `lib/companyUtils.ts`
- Update: `lib/redFlags.ts` (keep existing data)

### **Pages**
- Update: `app/page.tsx` (main page logic)
- New: `app/api/submit/route.ts` (API endpoint)

## 🎯 Key Benefits

### **User Experience**
- More authentic reflection tool
- Flexible interaction model
- Better mobile experience
- Clear value proposition

### **Data Quality**
- Clean company database
- Accurate pattern recognition
- Scalable insights
- Privacy-respecting

### **Community Impact**
- Workplace transparency
- Informed decision-making
- Collective knowledge building
- Industry insights

---

*This workflow transforms the tool from a game into a serious professional development platform while building a valuable database of workplace insights.* 