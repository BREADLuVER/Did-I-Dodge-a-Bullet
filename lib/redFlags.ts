export interface RedFlag {
  id: string;
  text: string;
  category: 'culture' | 'leadership' | 'role' | 'process' | 'communication' | 'compensation' | 'stability' | 'environment';
  severity: 'light' | 'medium';
  explanation?: string;
}

export const redFlags: RedFlag[] = [
  // LIGHT (Subtle Gut Pulls)
  {
    id: 'culture-family',
    text: 'They described the team as a "family"',
    category: 'culture',
    severity: 'light',
    explanation: 'Often code for "we expect you to work overtime without complaint"'
  },
  {
    id: 'culture-hardworking',
    text: 'Culture is "hardworking"-no examples given',
    category: 'culture',
    severity: 'light',
    explanation: 'Vague terms often hide unrealistic expectations and poor boundaries'
  },
  {
    id: 'schedule-flexible',
    text: 'They need someone "very flexible" with schedule',
    category: 'culture',
    severity: 'light',
    explanation: 'Code for unpredictable hours and last-minute demands'
  },
  {
    id: 'role-no-supervision',
    text: '"Able to work without supervision"-no mentor/teammates',
    category: 'role',
    severity: 'light',
    explanation: 'You\'ll be isolated with no support or guidance'
  },
  {
    id: 'culture-overtime',
    text: '"Sometimes we stay overtime"',
    category: 'culture',
    severity: 'light',
    explanation: 'Unpaid overtime is expected and normalized'
  },
  {
    id: 'culture-not-9to5',
    text: '"This is not going to be a 9-to-5 job"',
    category: 'culture',
    severity: 'light',
    explanation: 'They\'re warning you about long hours upfront'
  },
  {
    id: 'role-ad-hoc',
    text: '"Perform ad hoc duties as assigned"',
    category: 'role',
    severity: 'light',
    explanation: 'You\'ll be doing random tasks outside your job description'
  },
  {
    id: 'culture-no-vacation',
    text: 'They don\'t take vacation-or leaders brag they skip leave',
    category: 'culture',
    severity: 'light',
    explanation: 'Work-life balance is not valued here'
  },
  {
    id: 'stability-lawsuit',
    text: 'They lost a lawsuit-casually mentioned it',
    category: 'stability',
    severity: 'light',
    explanation: 'Legal problems suggest deeper organizational issues'
  },
  {
    id: 'environment-tense',
    text: 'Office feels tense-no one smiles',
    category: 'environment',
    severity: 'light',
    explanation: 'Toxic work environment is visible even during interviews'
  },
  {
    id: 'environment-dirty',
    text: 'Dirty floors, weird smells, closed-off vibe',
    category: 'environment',
    severity: 'light',
    explanation: 'Poor physical environment reflects poor management'
  },
  {
    id: 'comp-dress-code',
    text: 'Business casual enforced with low pay',
    category: 'compensation',
    severity: 'light',
    explanation: 'They care more about appearance than fair compensation'
  },
  {
    id: 'culture-chill-tone',
    text: 'They say "we\'re chill"-but shift tone later',
    category: 'culture',
    severity: 'light',
    explanation: 'Inconsistent messaging suggests disorganization'
  },
  {
    id: 'communication-interrupt',
    text: 'Interviewer interrupts or answers for you',
    category: 'communication',
    severity: 'light',
    explanation: 'Shows disrespect and poor listening skills'
  },
  {
    id: 'communication-condescension',
    text: 'Interviewer shows disdain or condescension',
    category: 'communication',
    severity: 'light',
    explanation: 'They don\'t respect candidates as equals'
  },
  {
    id: 'process-hr-only',
    text: 'Only meetings with HR-no manager contact',
    category: 'process',
    severity: 'light',
    explanation: 'Your future boss doesn\'t care enough to meet you'
  },
  {
    id: 'process-illegal-questions',
    text: 'They ask illegal or overly personal questions',
    category: 'process',
    severity: 'light',
    explanation: 'Shows ignorance of employment law and boundaries'
  },
  {
    id: 'process-no-questions',
    text: 'They ask zero questions other than availability',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t care about your skills or fit'
  },
  {
    id: 'communication-no-positives',
    text: 'The interviewer never mentions anything good about the company',
    category: 'communication',
    severity: 'light',
    explanation: 'If they can\'t find positives, there probably aren\'t any'
  },
  {
    id: 'process-unclear-business',
    text: 'They can\'t clearly explain what the company actually does',
    category: 'process',
    severity: 'light',
    explanation: 'Lack of clarity suggests disorganization or deception'
  },
  {
    id: 'process-unrelated-hobbies',
    text: 'They ask about hobbies or side projects that aren\'t remotely related',
    category: 'process',
    severity: 'light',
    explanation: 'Shows they don\'t understand the role or are fishing for free work'
  },
  {
    id: 'process-dodge-questions-asked',
    text: 'They dodge "What are your questions?" or actually say there aren\'t any',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t want you to know what you\'re getting into'
  },
  {
    id: 'role-vague-structure',
    text: 'Team structure is vague-no org chart or reporting clarity',
    category: 'role',
    severity: 'light',
    explanation: 'You won\'t know who you report to or how decisions are made'
  },
  {
    id: 'role-no-onboarding',
    text: 'They say "we trust you\'ll figure it out"-no onboarding plan',
    category: 'role',
    severity: 'light',
    explanation: 'You\'ll be thrown in without support or guidance'
  },
  {
    id: 'culture-vague-only',
    text: 'They use "culture" as the only positive descriptor-no specifics',
    category: 'culture',
    severity: 'light',
    explanation: 'Vague culture claims often hide toxic environments'
  },
  {
    id: 'process-no-peers',
    text: 'You never meet the direct peer team or immediate stakeholders',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t want you to see the team dynamics'
  },
  {
    id: 'process-unrelated-problem',
    text: 'They ask you to solve a problem off-the-cuff unrelated to the job',
    category: 'process',
    severity: 'light',
    explanation: 'They\'re either unprepared or trying to get free work'
  },
  {
    id: 'process-no-project-examples',
    text: 'They can\'t give an example of a big project the team shipped',
    category: 'process',
    severity: 'light',
    explanation: 'The team either doesn\'t accomplish much or leadership is disconnected'
  },
  {
    id: 'process-no-growth-questions',
    text: 'No one asks about your growth ambitions-just availability',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t care about your development or long-term fit'
  },
  {
    id: 'comp-vague-only',
    text: 'They talk comp vaguely: "market rate", "competitive" only',
    category: 'compensation',
    severity: 'light',
    explanation: 'Vague terms usually mean below-market pay'
  },
  {
    id: 'process-no-technical-test',
    text: 'Interview skips deep technical/role questions-you don\'t get tested',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t care if you can actually do the job'
  },
  {
    id: 'process-no-progression',
    text: 'No mention of career progression or development at all',
    category: 'process',
    severity: 'light',
    explanation: 'You\'ll be stuck in the same role with no advancement'
  },
  {
    id: 'process-no-process-questions',
    text: 'They don\'t ask about your process-just whether you can "get it done"',
    category: 'process',
    severity: 'light',
    explanation: 'They only care about results, not sustainable work practices'
  },
  {
    id: 'culture-startup-vibe-vague',
    text: 'They say "it\'s a startup vibe" without describing what that actually means',
    category: 'culture',
    severity: 'light',
    explanation: 'Vague startup claims often mean chaos and poor processes'
  },
  {
    id: 'process-dodge-success-metrics',
    text: 'The interviewer deflects when you ask about how success is measured',
    category: 'process',
    severity: 'light',
    explanation: 'They either don\'t know or the metrics are unreasonable'
  },
  {
    id: 'communication-exhausted-interviewers',
    text: 'Exhausted low energy interviewers or visibly unhappy',
    category: 'communication',
    severity: 'light',
    explanation: 'Current employees are burned out and miserable'
  },
  {
    id: 'communication-no-help',
    text: 'Interviewers not helping you when stuck',
    category: 'communication',
    severity: 'light',
    explanation: 'They don\'t support people who need assistance'
  },
  {
    id: 'process-no-answers',
    text: '"We also don\'t have an answer to these questions"',
    category: 'process',
    severity: 'light',
    explanation: 'They\'re disorganized and unprepared'
  },
  {
    id: 'process-unrelated-practical',
    text: 'A practical test that had nothing to do with the position',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t understand the role or are getting free work'
  },
  {
    id: 'communication-aggressive',
    text: 'Aggressive interviewer',
    category: 'communication',
    severity: 'light',
    explanation: 'Hostile behavior suggests a toxic work environment'
  },
  {
    id: 'communication-canned-questions',
    text: 'Asking canned questions rather than having a conversation',
    category: 'communication',
    severity: 'light',
    explanation: 'They don\'t care about you as a person, just checking boxes'
  },
  {
    id: 'communication-defensive',
    text: 'Unprepared to answer questions themselves or being defensive',
    category: 'communication',
    severity: 'light',
    explanation: 'They\'re hiding problems or don\'t know their own company'
  },
  {
    id: 'process-resume-not-read',
    text: 'Struggles to find or pull up your resume - never read it',
    category: 'process',
    severity: 'light',
    explanation: 'They don\'t care enough to prepare for the interview'
  },
  {
    id: 'culture-work-hard-play-hard',
    text: 'Work hard play hard in a fast-paced environment',
    category: 'culture',
    severity: 'light',
    explanation: 'Code for burnout culture with mandatory socializing'
  },
  {
    id: 'culture-dynamic-fast-paced',
    text: 'Dynamic, fast paced, high throughput',
    category: 'culture',
    severity: 'light',
    explanation: 'Chaos and constant pressure with no time to think'
  },
  {
    id: 'process-ghosted',
    text: 'Ghosted after interview',
    category: 'process',
    severity: 'light',
    explanation: 'Complete disrespect for your time and effort'
  },
  {
    id: 'stability-offshoring',
    text: 'Mentioned offshoring',
    category: 'stability',
    severity: 'light',
    explanation: 'Your job might be eliminated or moved overseas'
  },
  {
    id: 'process-many-interviews',
    text: 'More than 3 interviews',
    category: 'process',
    severity: 'light',
    explanation: 'Indecisive leadership or they\'re stringing you along'
  },
  {
    id: 'process-weeks-between',
    text: 'Weeks between interviews',
    category: 'process',
    severity: 'light',
    explanation: 'Disorganized process or they\'re not serious about hiring'
  },
  {
    id: 'process-late-interviewer',
    text: 'Late interviewer',
    category: 'process',
    severity: 'light',
    explanation: 'Disrespect for your time and poor organization'
  },
  {
    id: 'process-presentation-project',
    text: 'Presentation or project required',
    category: 'process',
    severity: 'light',
    explanation: 'They\'re getting free work or making you jump through hoops'
  },
  {
    id: 'process-zero-detail',
    text: 'Zero detail about what\'s tested in upcoming interviews',
    category: 'process',
    severity: 'light',
    explanation: 'They\'re keeping you in the dark about the process'
  },

  // MEDIUM (Noticeable Details)
  {
    id: 'role-conflicting',
    text: 'Conflicting job descriptions from different interviewers',
    category: 'role',
    severity: 'medium',
    explanation: 'Nobody knows what you\'ll actually be doing'
  },
  {
    id: 'comp-dodge-questions',
    text: 'They dodge career growth or salary questions',
    category: 'compensation',
    severity: 'medium',
    explanation: 'They have no plan for your development or fair pay'
  },
  {
    id: 'comp-cherry-picked',
    text: 'They showed cherry-picked pay stubs',
    category: 'compensation',
    severity: 'medium',
    explanation: 'Manipulative tactics to justify low pay'
  },
  {
    id: 'comp-no-numbers',
    text: '"Competitive pay" with no numbers',
    category: 'compensation',
    severity: 'medium',
    explanation: 'If they won\'t share ranges, they\'re probably low-balling'
  },
  {
    id: 'process-reschedule',
    text: 'They keep rescheduling with no explanation',
    category: 'process',
    severity: 'medium',
    explanation: 'Shows disrespect for your time and poor organization'
  },
  {
    id: 'process-no-questions-allowed',
    text: 'Asked not to bring questions-they\'d "tell you everything"',
    category: 'process',
    severity: 'medium',
    explanation: 'They don\'t want you to know what you\'re getting into'
  },
  {
    id: 'stability-rushed',
    text: 'Hiring feels rushed-seems desperate',
    category: 'stability',
    severity: 'medium',
    explanation: 'Could mean high turnover or someone quit suddenly'
  },
  {
    id: 'role-on-call',
    text: 'On-call or rotating shifts with no limits',
    category: 'role',
    severity: 'medium',
    explanation: 'Your personal time will be constantly invaded'
  },
  {
    id: 'process-poor-control',
    text: 'They control interview process poorly-missed meetings, wrong links',
    category: 'process',
    severity: 'medium',
    explanation: 'If they can\'t organize an interview, how will they manage work?'
  },
  {
    id: 'comp-financial-baseline',
    text: 'They ask for personal financial baseline (e.g. "what\'s the least you need to live on")',
    category: 'compensation',
    severity: 'medium',
    explanation: 'They\'re trying to pay you the absolute minimum'
  },
  {
    id: 'process-immediate-start',
    text: 'They expect you to start immediately',
    category: 'process',
    severity: 'medium',
    explanation: 'No respect for your current commitments or notice period'
  },
  {
    id: 'culture-no-vacation-discouraged',
    text: 'They discourage taking vacation-"too busy"',
    category: 'culture',
    severity: 'medium',
    explanation: 'Work-life balance is actively discouraged'
  },
  {
    id: 'process-no-job-questions',
    text: 'They ask you zero questions about the job',
    category: 'process',
    severity: 'medium',
    explanation: 'They don\'t care if you\'re qualified or interested'
  },
  {
    id: 'process-dodge-reviews',
    text: 'They dodge Glassdoor or review transparency',
    category: 'process',
    severity: 'medium',
    explanation: 'They know their reputation is bad'
  },
  {
    id: 'process-no-selling',
    text: 'They aren\'t selling you the role-no benefits or vision',
    category: 'process',
    severity: 'medium',
    explanation: 'They don\'t care if you want to work there'
  },
  {
    id: 'communication-love-bombing',
    text: 'Love-bombing-overly complimentary to mask dysfunction',
    category: 'communication',
    severity: 'medium',
    explanation: 'Excessive flattery often hides serious problems'
  },

  // MEDIUM (Noticeable Details) - Continued
  {
    id: 'stability-predecessor',
    text: 'Predecessor left very early in the role',
    category: 'stability',
    severity: 'medium',
    explanation: 'The role is clearly toxic or impossible'
  },
  {
    id: 'communication-gossip',
    text: 'Interviewers gossip negatively about candidates or staff',
    category: 'communication',
    severity: 'medium',
    explanation: 'They\'ll talk about you the same way'
  },
  {
    id: 'stability-predecessor-sudden',
    text: 'The last person in the role left suddenly',
    category: 'stability',
    severity: 'medium',
    explanation: 'They\'re hiding the real reason someone quit - likely toxicity or impossible expectations'
  }
];

export const getBalancedRedFlags = (): RedFlag[] => {
  // Return all flags shuffled for the flexible interview checkup
  return [...redFlags].sort(() => 0.5 - Math.random());
}; 