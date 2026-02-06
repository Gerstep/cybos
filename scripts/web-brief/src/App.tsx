import React, { useState, useEffect } from 'react';
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
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { fetchBrief } from './api';
import { ExplorerPage } from './pages/ExplorerPage';
import { UnstuckPage } from './pages/UnstuckPage';
import { SetupWizard } from './pages/SetupWizard';
import type { BriefData } from './types';

type PageType = 'brief' | 'explorer' | 'unstuck' | 'setup';

// ===== COMPONENTS =====

const SectionHeader: React.FC<{ title: string; count?: number; icon?: React.ElementType }> = ({ title, count, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-8 mt-16 group cursor-default">
    <div className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg group-hover:bg-gray-50 transition-colors">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h2>
    </div>
    {count !== undefined && count > 0 && (
      <span className="bg-gray-100 text-gray-600 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
        {count}
      </span>
    )}
    <div className="h-px bg-gray-100 flex-1 ml-4" />
  </div>
);

const ErrorDisplay: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
    <div className="flex items-center gap-3 text-red-600 mb-3">
      <AlertCircle className="w-6 h-6" />
      <span className="font-bold text-lg">Error loading brief</span>
    </div>
    <p className="text-red-700 mb-4">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    )}
  </div>
);

const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Loading brief...</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ day: string }> = ({ day }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Calendar className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No brief for {day}</h3>
    <p className="text-gray-500 mb-6">Run <code className="bg-gray-100 px-2 py-1 rounded">/cyber-brief</code> to generate</p>
  </div>
);

// ===== MAIN APP =====

const App: React.FC = () => {
  // State
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageType>(() => {
    // Check pathname for specific routes
    if (window.location.pathname === '/unstuck') {
      return 'unstuck';
    }
    if (window.location.pathname === '/setup' || window.location.pathname.startsWith('/setup')) {
      return 'setup';
    }
    // Otherwise check query params
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    return pageParam === 'explorer' ? 'explorer' : 'brief';
  });
  const [day, setDay] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const dayParam = params.get('day');
    if (dayParam) return dayParam;
    return 'today';
  });

  // Helper to convert date to MMDD-YY format
  const dateToKey = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}${dd}-${yy}`;
  };

  // Helper to parse day string to Date
  const dayToDate = (d: string): Date => {
    if (d === 'today') return new Date();
    if (d === 'yesterday') {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }
    // Parse MMDD-YY format
    const match = d.match(/^(\d{2})(\d{2})-(\d{2})$/);
    if (match) {
      const [_, month, day, year] = match;
      return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date();
  };

  // Check if a day is today
  const isToday = (d: string): boolean => {
    const date = dayToDate(d);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = dayToDate(day);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const today = new Date();
    // Don't go into the future
    if (currentDate > today) return;

    // Use 'today' for today's date, otherwise use MMDD-YY
    if (currentDate.toDateString() === today.toDateString()) {
      setDay('today');
    } else {
      setDay(dateToKey(currentDate));
    }
  };

  // Handle navigation between Brief and Explorer
  const handleNavigate = (newPage: string) => {
    const validPage = newPage === 'explorer' ? 'explorer' : 'brief';
    setPage(validPage);
    const url = new URL(window.location.href);
    url.searchParams.set('page', validPage);
    window.history.replaceState({}, '', url.toString());
  };

  // Load brief when day changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchBrief(day)
      .then((data) => {
        setBrief(data);
        setError(null);
      })
      .catch((e) => {
        setError(e.message);
        setBrief(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('day', day);
    window.history.replaceState({}, '', url.toString());
  }, [day]);

  // Format current date for header
  const formatHeaderDate = () => {
    const date = dayToDate(day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  // Generate summary text
  const generateSummary = () => {
    if (!brief) return '';

    const parts: string[] = [];

    if (brief.priorities.length > 0) {
      const urgent = brief.priorities.filter(p => p.type === 'urgent').length;
      const blocking = brief.priorities.filter(p => p.type === 'blocking').length;
      if (urgent > 0) parts.push(`<span class="text-black font-semibold">${urgent} urgent</span>`);
      if (blocking > 0) parts.push(`<span class="text-black font-semibold">${blocking} blocking</span>`);
    }

    if (brief.schedule.length > 0) {
      const meetings = brief.schedule.filter(s => s.type === 'meeting' || s.type === 'call').length;
      if (meetings > 0) parts.push(`<span class="text-black font-semibold">${meetings} meetings</span>`);
    }

    if (parts.length === 0) {
      return 'A light day ahead.';
    }

    return `You have ${parts.join(' and ')} to address.`;
  };

  // Normalize communications for unified inbox view
  const getCommunications = () => {
    if (!brief) return [];

    const items = [
      ...brief.messages.map(m => ({
        id: m.id,
        type: 'message' as const,
        platform: m.platform,
        sender: m.sender,
        body: m.text,
        context: m.context,
        timestamp: m.timestamp,
        icon: m.platform === 'slack' ? Hash : MessageSquare,
        color: 'bg-blue-50 text-blue-600'
      })),
      ...brief.emails.map(e => ({
        id: e.id,
        type: 'email' as const,
        platform: 'Email' as const,
        sender: e.sender,
        body: e.snippet || e.subject,
        context: e.subject,
        timestamp: e.time,
        icon: Mail,
        color: 'bg-amber-50 text-amber-600'
      }))
    ];

    return items;
  };

  // Loading state (only for Brief page)
  if (loading && page === 'brief') {
    return <LoadingState />;
  }

  // Render Setup Wizard if selected
  if (page === 'setup') {
    return <SetupWizard />;
  }

  // Render Unstuck page if selected
  if (page === 'unstuck') {
    return <UnstuckPage />;
  }

  // Render Explorer page if selected
  if (page === 'explorer') {
    return <ExplorerPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-500 selection:text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">

        {/* HEADER */}
        <header className="pt-24 pb-16">
          {/* Day Toggle and Page Navigation */}
          <div className="flex items-center gap-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Briefing</span>
            </div>

            <div className="flex-1" />

            {/* Page Navigation Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-full mr-2">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 bg-white shadow-sm ring-1 ring-black/5"
              >
                Brief
              </button>
              <button
                onClick={() => handleNavigate('explorer')}
                className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Explorer
              </button>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => navigateDay('prev')}
                className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDay('today')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${isToday(day)
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Today
              </button>
              <button
                onClick={() => navigateDay('next')}
                disabled={isToday(day)}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${isToday(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                  }`}
                title="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-black">
            {formatHeaderDate().split(',')[0]}, <span className="text-gray-300">{formatHeaderDate().split(',')[1]}</span>
          </h1>

          {error ? (
            <ErrorDisplay error={error} onRetry={() => setDay(day)} />
          ) : brief ? (
            <p
              className="text-gray-500 font-medium text-lg max-w-xl leading-relaxed"
              dangerouslySetInnerHTML={{ __html: generateSummary() }}
            />
          ) : (
            <EmptyState day={day} />
          )}
        </header>

        {/* Only show sections if we have brief data */}
        {brief && (
          <>
            {/* SYSTEM SYNTHESIS */}
            {brief.synthesis && (
              <section className="mb-16">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="relative p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg text-white shadow-lg shadow-gray-200">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">System Synthesis</span>
                    </div>

                    <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-serif">
                      {brief.synthesis}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* PRIORITY ACTIONS */}
            {brief.priorities.length > 0 && (
              <section>
                <SectionHeader title="Priority Actions" count={brief.priorities.length} icon={Zap} />
                <div className="grid gap-4">
                  {brief.priorities.map((item) => (
                    <div key={item.id} className="group relative p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {item.type === 'urgent' && (
                            <div className="px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-[10px] font-bold uppercase tracking-wider text-rose-600">Urgent</div>
                          )}
                          {item.type === 'blocking' && (
                            <div className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-bold uppercase tracking-wider text-amber-600">Blocking</div>
                          )}
                          {item.type === 'review' && (
                            <div className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-600">Review</div>
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
            )}

            {/* TODAY'S SCHEDULE */}
            {brief.schedule.length > 0 && (
              <section>
                <SectionHeader title="Today's Schedule" icon={Calendar} />
                <div className="relative pl-4">
                  <div className="absolute left-[83px] top-4 bottom-4 w-px bg-gray-100"></div>

                  <div className="space-y-8">
                    {brief.schedule.map((event) => (
                      <div key={event.id} className="relative flex items-start group">
                        <div className="w-16 pt-1 text-right pr-6 shrink-0 z-10 bg-white">
                          <span className="block text-sm font-bold text-gray-900 font-mono tracking-tight">{event.time}</span>
                          <span className="block text-[10px] font-bold text-gray-400 mt-1">{event.duration}</span>
                        </div>

                        <div className="absolute left-[80px] top-2.5 w-1.5 h-1.5 rounded-full border border-white ring-1 ring-gray-200 bg-white z-20 group-hover:ring-black group-hover:scale-125 transition-all duration-300">
                          <div className={`w-full h-full rounded-full ${event.type === 'meeting' ? 'bg-blue-500' :
                              event.type === 'deep-work' ? 'bg-purple-500' : 'bg-gray-400'
                            }`}></div>
                        </div>

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
                                {event.attendees.slice(0, 4).map((attendee, i) => (
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
            )}

            {/* STRATEGIC LEVERAGE */}
            {brief.leverage.length > 0 && (
              <section>
                <SectionHeader title="Strategic Leverage" count={brief.leverage.length} icon={Zap} />
                <div className="space-y-6">
                  {brief.leverage.map((item) => (
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
                          {item.recommendation.quickAction} <ArrowRight className="w-3 h-3" />
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
            )}

            {/* UNIFIED INBOX */}
            {getCommunications().length > 0 && (
              <section>
                <SectionHeader title="Inbox" count={getCommunications().length} icon={Inbox} />
                <div className="space-y-2">
                  {getCommunications().map((item) => {
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
            )}

            {/* TASKS */}
            {brief.tasks.length > 0 && (
              <section>
                <SectionHeader title="GTD Actions" count={brief.tasks.length} icon={CheckSquare} />
                <div className="grid grid-cols-1 gap-1">
                  {brief.tasks.map((task) => (
                    <div key={task.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'done'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-200 group-hover:border-black'
                        }`}>
                        {task.status === 'done' && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-bold transition-colors ${task.status === 'done'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-700 group-hover:text-black'
                          }`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                          {task.project}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-rose-500' :
                            task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ERRORS */}
            {brief.errors.length > 0 && (
              <section>
                <SectionHeader title="Errors During Generation" icon={AlertCircle} />
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <ul className="space-y-2">
                    {brief.errors.map((err, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default App;
