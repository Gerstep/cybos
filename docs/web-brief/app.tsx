import React from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  CheckSquare, 
  Calendar,
  Zap,
  Activity,
  Hash,
  Inbox,
  MoreHorizontal
} from 'lucide-react';

// --- TYPES ---

export interface PriorityItem {
  id: string;
  title: string;
  type: 'urgent' | 'blocking' | 'review';
  context: string;
  action: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  attendees: string[];
  type: 'meeting' | 'deep-work' | 'call';
  prepContext?: string;
}

export interface MessageItem {
  id: string;
  platform: 'telegram' | 'slack' | 'imessage';
  sender: string;
  avatar?: string;
  text: string;
  context?: string;
  timestamp: string;
}

export interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  isImportant: boolean;
  time: string;
}

export interface TaskItem {
  id: string;
  title: string;
  project: string;
  status: 'todo' | 'done';
  priority: 'high' | 'medium' | 'low';
}

export interface LeverageItem {
  id: string;
  title: string;
  score: string;
  problem: string;
  impact: string;
  source: string;
  recommendation: {
    task: string;
    quickAction: string;
  };
}

// --- MOCK DATA ---

const MOCK_PRIORITIES: PriorityItem[] = [
  { 
    id: 'p1', 
    title: 'Approve Series A Deck', 
    type: 'blocking', 
    context: 'Design team is blocked on slide 7 (Financials). Needs sign-off before 2 PM investor call.',
    action: 'Review Slide 7'
  },
  { 
    id: 'p2', 
    title: 'Urgent: Wire Transfer Pending', 
    type: 'urgent', 
    context: 'OpCo needs authorization for Q1 server costs ($45k). Deadline is EOD today.',
    action: 'Authorize Payment'
  }
];

const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '09:00',
    duration: '30m',
    title: 'Weekly Sync with Engineering',
    attendees: ['Alex', 'Sarah', 'Mike'],
    type: 'meeting',
    prepContext: 'Review PR #402 regarding auth flow changes.'
  },
  {
    id: 's2',
    time: '10:30',
    duration: '1h',
    title: 'Investor Call: Sequoia',
    attendees: ['Roelof', 'Partner'],
    type: 'call',
    prepContext: 'Series A Deck finalized. Key metric: Retention up 15% MoM.'
  },
  {
    id: 's3',
    time: '14:00',
    duration: '2h',
    title: 'Deep Work: Q2 Strategy',
    attendees: [],
    type: 'deep-work'
  }
];

const MOCK_MESSAGES: MessageItem[] = [
  {
    id: 'm1',
    platform: 'telegram',
    sender: 'Jason (Product)',
    text: "We have a decision to make on the pricing tier. Are we grandfathering existing users? Need an answer by noon.",
    context: 'Ref: Pricing Strategy Doc',
    timestamp: '10m ago'
  },
  {
    id: 'm2',
    platform: 'telegram',
    sender: 'Elena (Legal)',
    text: "Term sheet comments are in. Section 4 needs your eyes specifically regarding the liquidation preference.",
    timestamp: '1h ago'
  }
];

const MOCK_EMAILS: EmailItem[] = [
  {
    id: 'e1',
    sender: 'Stripe',
    subject: 'Action Required: Verify your business details',
    snippet: 'We need to verify your beneficial ownership information to continue payouts...',
    isImportant: true,
    time: '08:45'
  },
  {
    id: 'e2',
    sender: 'Sam Altman',
    subject: 'Re: Catch up',
    snippet: 'Sounds good. Let\'s do next Tuesday. I\'m free after 3pm PT.',
    isImportant: true,
    time: 'Yesterday'
  }
];

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Review Q1 Hiring Plan',
    project: 'Operations',
    status: 'todo',
    priority: 'high'
  },
  {
    id: 't2',
    title: 'Sign Advisor Agreement for Sarah',
    project: 'Legal',
    status: 'todo',
    priority: 'medium'
  },
  {
    id: 't3',
    title: 'Book flights for NY Trip',
    project: 'Personal',
    status: 'todo',
    priority: 'low'
  }
];

const MOCK_LEVERAGE_ITEMS: LeverageItem[] = [
  {
    id: 'l1',
    title: "Retention Loop Optimization",
    score: "9.2",
    problem: "Drop-off at day 3 is increasing by 5%",
    impact: "Projected 12% loss in LTV by Q2 if unaddressed",
    source: "Mixpanel & Growth Weekly",
    recommendation: {
      task: "Approve new onboarding flow variant B",
      quickAction: "Greenlight Deploy"
    }
  },
  {
    id: 'l2',
    title: "Enterprise Sales Motion",
    score: "8.7",
    problem: "SDRs are lacking collateral for 'Security' objections",
    impact: "3 deals stalled in procurement phase",
    source: "Salesforce Pipeline",
    recommendation: {
      task: "Commission security whitepaper for enterprise",
      quickAction: "Slack Marketing"
    }
  }
];

// --- COMPONENTS ---

const SectionHeader: React.FC<{ title: string; count?: number; icon?: React.ElementType }> = ({ title, count, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-8 mt-16 group cursor-default">
    <div className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg group-hover:bg-gray-50 transition-colors">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h2>
    </div>
    {count !== undefined && (
      <span className="bg-gray-100 text-gray-600 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
        {count}
      </span>
    )}
    <div className="h-px bg-gray-100 flex-1 ml-4" />
  </div>
);

const App: React.FC = () => {
  // Normalize and merge communications for the unified view
  const communications = [
    ...MOCK_MESSAGES.map(m => ({
      id: m.id,
      type: 'message',
      platform: m.platform,
      sender: m.sender,
      body: m.text,
      context: m.context,
      timestamp: m.timestamp,
      icon: m.platform === 'slack' ? Hash : MessageSquare,
      color: 'bg-blue-50 text-blue-600'
    })),
    ...MOCK_EMAILS.map(e => ({
      id: e.id,
      type: 'email',
      platform: 'Email',
      sender: e.sender,
      body: e.snippet,
      context: e.subject,
      timestamp: e.time,
      icon: Mail,
      color: 'bg-amber-50 text-amber-600'
    }))
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-500 selection:text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        
        {/* HEADER */}
        <header className="pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Briefing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-black">
            Tuesday, <span className="text-gray-300">17 Dec</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl leading-relaxed">
            Good morning. You have <span className="text-black font-semibold">2 critical blockers</span> and a <span className="text-black font-semibold">high-stakes meeting</span> with Sequoia at 10:30 AM.
          </p>
        </header>

        {/* 0. EXECUTIVE SNAPSHOT - REDESIGNED */}
        <section className="mb-16">
          <div className="relative group">
             {/* Subtle Glow Behind */}
             <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             
             {/* Main Box */}
             <div className="relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                    {/* New Icon Badge */}
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg text-white shadow-lg shadow-gray-200">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">System Synthesis</span>
                </div>
                
                <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-serif">
                    The investment pipeline is <span className="border-b-2 border-blue-200 text-gray-900 font-medium">surging</span>. Finance just dropped 2026 allocations—action needed by EOM. Hiring is currently a <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-md mx-1">bottleneck</span> for Q2 goals.
                </p>
             </div>
          </div>
        </section>

        {/* 1. PRIORITY ACTIONS */}
        <section>
          <SectionHeader title="Priority Actions" count={MOCK_PRIORITIES.length} icon={Zap} />
          <div className="grid gap-4">
            {MOCK_PRIORITIES.map((item) => (
              <div key={item.id} className="group relative p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {item.type === 'urgent' && (
                            <div className="px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-[10px] font-bold uppercase tracking-wider text-rose-600">Urgent</div>
                        )}
                        {item.type === 'blocking' && (
                            <div className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-bold uppercase tracking-wider text-amber-600">Blocking</div>
                        )}
                    </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 font-serif text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium max-w-lg">
                  {item.context}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black group-hover:text-blue-600 transition-colors">
                        <CheckSquare className="w-4 h-4" />
                        {item.action}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TODAY'S SCHEDULE */}
        <section>
          <SectionHeader title="Today's Schedule" icon={Calendar} />
          <div className="relative pl-4">
            {/* Continuous timeline line - positioned perfectly to connect dots */}
            <div className="absolute left-[83px] top-4 bottom-4 w-px bg-gray-100"></div>

            <div className="space-y-8">
              {MOCK_SCHEDULE.map((event, idx) => (
                <div key={event.id} className="relative flex items-start group">
                  {/* Time Column - Fixed width, right aligned */}
                  <div className="w-16 pt-1 text-right pr-6 shrink-0 z-10 bg-white">
                    <span className="block text-sm font-bold text-gray-900 font-mono tracking-tight">{event.time}</span>
                    <span className="block text-[10px] font-bold text-gray-400 mt-1">{event.duration}</span>
                  </div>

                  {/* Timeline Dot - Positioned absolutely to sit on the line */}
                  <div className="absolute left-[80px] top-2.5 w-1.5 h-1.5 rounded-full border border-white ring-1 ring-gray-200 bg-white z-20 group-hover:ring-black group-hover:scale-125 transition-all duration-300">
                     {/* Inner active dot based on type */}
                     <div className={`w-full h-full rounded-full ${
                        event.type === 'meeting' ? 'bg-blue-500' :
                        event.type === 'deep-work' ? 'bg-purple-500' : 'bg-gray-400'
                     }`}></div>
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 ml-8 p-5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 cursor-default">
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base font-bold text-gray-900 leading-snug">{event.title}</h4>
                        {event.type === 'call' && <span className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-gray-100 uppercase tracking-wider text-gray-400">Call</span>}
                    </div>
                    
                    {event.prepContext && (
                        <div className="flex items-start gap-2 mb-3 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 max-w-fit">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <span className="text-xs font-medium text-amber-700 leading-snug">{event.prepContext}</span>
                        </div>
                    )}

                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-1.5">
                          {event.attendees.map((attendee, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase shadow-sm">
                              {attendee[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          with {event.attendees.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. STRATEGIC LEVERAGE */}
        <section>
           <SectionHeader title="Strategic Leverage" count={MOCK_LEVERAGE_ITEMS.length} icon={Zap} />
           <div className="space-y-6">
            {MOCK_LEVERAGE_ITEMS.map((item, idx) => (
              <div key={item.id} className="group p-6 rounded-2xl border border-dashed border-gray-200 hover:border-solid hover:border-black hover:bg-gray-50 transition-all duration-300">
                 <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold font-serif mb-1">{item.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Score: {item.score}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">• {item.source}</span>
                        </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        Execute <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-3 rounded-lg">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">The Problem</span>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{item.problem}</p>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-lg">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Risk Factor</span>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{item.impact}</p>
                    </div>
                 </div>
              </div>
            ))}
           </div>
        </section>

        {/* 4. UNIFIED COMMUNICATIONS (Inbox) */}
        <section>
          <SectionHeader title="Inbox" count={communications.length} icon={Inbox} />
          <div className="space-y-2">
            {communications.map((item) => {
              const Icon = item.icon;
              return (
                <div key={`${item.type}-${item.id}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-default group">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.color} mt-1`}>
                      <Icon className="w-4 h-4" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{item.sender}</span>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.platform}</span>
                         </div>
                         <span className="text-[10px] font-mono text-gray-400 font-medium">{item.timestamp}</span>
                      </div>
                      
                      {item.context && (
                        <div className="text-xs font-bold text-gray-800 mb-1 truncate">{item.context}</div>
                      )}
                      
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {item.body}
                      </p>
                   </div>
                   
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. TASKS */}
        <section>
          <SectionHeader title="GTD Actions" count={MOCK_TASKS.length} icon={CheckSquare} />
          <div className="grid grid-cols-1 gap-1">
            {MOCK_TASKS.map((task) => (
              <div key={task.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-5 h-5 rounded border-2 border-gray-200 group-hover:border-black transition-colors flex items-center justify-center">
                    {/* Checkbox visual placeholder */}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-700 group-hover:text-black transition-colors">{task.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                    {task.project}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === 'high' ? 'bg-rose-500' : 
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default App;