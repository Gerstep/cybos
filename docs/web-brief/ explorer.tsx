
import React, { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Briefcase,
  Users,
  BarChart
} from 'lucide-react';

// --- TYPES ---

type ItemType = 'action' | 'promise' | 'decision' | 'metric' | 'question';
type TrustLevel = 'high' | 'medium' | 'low';
type SourceType = 'call' | 'email' | 'telegram' | 'slack';

interface Item {
  id: string;
  type: ItemType;
  content: string;
  quote: string;
  sourceType: SourceType;
  sourceDate: string;
  sourceId: string;
  trustLevel?: TrustLevel;
  owner?: string;
  target?: string;
  dealId?: string;
  personId?: string;
  companyId?: string;
}

interface Deal {
  id: string;
  name: string;
  variants: string[];
  lastActivity: string;
  metricsCount: number;
  mentionsCount: number;
  decisionsCount: number;
  preview: string;
  introducedBy?: string;
}

interface Person {
  id: string;
  name: string;
  email?: string;
  handle?: string;
  lastActivity: string;
  interactionCount: number;
  openItemsCount: number;
  lastInteractionType: string;
  isCandidate?: boolean;
}

interface Company {
    id: string;
    name: string;
}

// --- MOCK DATA ---

const MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Project Naptha',
    variants: ['Naptha', 'Naphta AI'],
    lastActivity: 'Jan 16',
    metricsCount: 3,
    mentionsCount: 5,
    decisionsCount: 1,
    preview: 'Retention metrics look strong (45% D30)',
    introducedBy: 'Sarah Guo'
  },
  {
    id: 'd2',
    name: 'Series A Round',
    variants: ['Series A', 'Fundraising'],
    lastActivity: 'Jan 15',
    metricsCount: 1,
    mentionsCount: 12,
    decisionsCount: 2,
    preview: 'Term sheet expected by Friday EOD'
  }
];

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Roelof Botha',
    email: 'roelof@sequoia.com',
    lastActivity: 'Jan 16',
    interactionCount: 4,
    openItemsCount: 2,
    lastInteractionType: 'call Jan 16'
  },
  {
    id: 'p2',
    name: 'Jason Calacanis',
    handle: '@jason',
    lastActivity: 'Jan 14',
    interactionCount: 2,
    openItemsCount: 1,
    lastInteractionType: 'email Jan 14'
  }
];

const MOCK_ITEMS: Item[] = [
  { id: 'i1', type: 'metric', content: 'D30 Retention is 45%', quote: "Whatever we did last month worked, retention is holding at 45% day 30.", sourceType: 'call', sourceDate: 'Jan 16', sourceId: 'Weekly Sync', trustLevel: 'high', dealId: 'd1', companyId: 'c1' },
  { id: 'i2', type: 'decision', content: 'Focus on enterprise tier for Q2', quote: "Let's just commit to the enterprise motion for the next quarter.", sourceType: 'call', sourceDate: 'Jan 16', sourceId: 'Weekly Sync', trustLevel: 'medium', dealId: 'd1' },
  { id: 'i3', type: 'action', content: 'Send updated financial model', quote: "Can you shoot over the new model before the partner meeting?", sourceType: 'email', sourceDate: 'Jan 15', sourceId: 'Thread: Due Diligence', owner: 'Me', target: 'Roelof', dealId: 'd2', personId: 'p1' },
  { id: 'i4', type: 'promise', content: 'Intro to Keith Rabois', quote: "I'll make the intro to Keith, he'd love this.", sourceType: 'call', sourceDate: 'Jan 16', sourceId: 'Call with Roelof', owner: 'Roelof Botha', target: 'Me', personId: 'p1' },
  { id: 'i5', type: 'promise', content: 'Review the term sheet draft', quote: "I will review the draft by tomorrow morning.", sourceType: 'email', sourceDate: 'Jan 14', sourceId: 'Re: Terms', owner: 'Me', target: 'Elena', personId: 'p3' },
  { id: 'i6', type: 'metric', content: '$4M ARR run rate', quote: "We are effectively at a $4M run rate now.", sourceType: 'slack', sourceDate: 'Jan 13', sourceId: '#growth', trustLevel: 'high', companyId: 'c1' },
  { id: 'i7', type: 'action', content: 'Book dinner reservation', quote: "Please book a table for 4 at Birdsong.", sourceType: 'telegram', sourceDate: 'Jan 12', sourceId: 'Chat with Jason', owner: 'Me', target: 'Jason', personId: 'p2' },
  { id: 'i8', type: 'decision', content: 'Hire the ex-Stripe PM', quote: "Okay, let's make an offer to the Stripe candidate.", sourceType: 'call', sourceDate: 'Jan 14', sourceId: 'Hiring Comm.', trustLevel: 'high' }
];

const MOCK_COMPANIES: Company[] = [
    { id: 'c1', name: 'Aura Inc.' }
];

// --- COMPONENTS ---

function TypeBadge({ type }: { type: ItemType }) {
  const styles = {
    action: 'bg-rose-50 text-rose-600 border-rose-100',
    promise: 'bg-blue-50 text-blue-600 border-blue-100',
    decision: 'bg-purple-50 text-purple-600 border-purple-100',
    metric: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    question: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${styles[type]}`}>
      {type}
    </span>
  );
}

function TrustBadge({ level }: { level?: TrustLevel }) {
  if (!level) return null;
  const colors = {
    high: 'text-emerald-500',
    medium: 'text-gray-400',
    low: 'text-amber-500'
  };
  return (
    <span className={`text-[10px] font-mono font-medium ${colors[level]}`}>
      {`{${level}}`}
    </span>
  );
}

function ItemCard({ item, compact, hideOwner }: { item: Item; compact?: boolean; hideOwner?: boolean }) {
  const getIcon = (type: SourceType) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'telegram': return MessageSquare;
      case 'slack': return MessageSquare;
      default: return MessageSquare;
    }
  };

  const SourceIcon = getIcon(item.sourceType);

  return (
    <div className={`group bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:shadow-sm transition-all ${compact ? 'py-2' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0"><TypeBadge type={item.type} /></div>
          <span className="text-sm font-medium text-gray-900 leading-snug">{item.content}</span>
        </div>
        <div className="shrink-0"><TrustBadge level={item.trustLevel} /></div>
      </div>

      {!compact && !hideOwner && (item.owner || item.target) && (
        <div className="flex items-center gap-2 mb-2 ml-[calc(3rem+4px)] text-xs text-gray-500">
          {item.owner && <span className="font-medium text-gray-700">Owner: {item.owner}</span>}
          {item.owner && item.target && <span className="text-gray-300">→</span>}
          {item.target && <span className="font-medium text-gray-700">Target: {item.target}</span>}
        </div>
      )}

      <div className={`text-xs text-gray-400 italic mb-2 ml-[calc(3rem+4px)] border-l-2 border-gray-100 pl-2 leading-relaxed ${compact ? 'line-clamp-1' : ''}`}>
        "{item.quote}"
      </div>

      <div className="flex items-center gap-2 ml-[calc(3rem+4px)] text-[10px] font-bold text-gray-400 uppercase tracking-wide">
        <SourceIcon className="w-3 h-3" />
        <span>{item.sourceType}</span>
        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
        <span>{item.sourceDate}</span>
        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
        <span className="truncate max-w-[150px]">{item.sourceId}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, icon: Icon }: { title: string; count: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-6 mt-12 group cursor-default">
      <div className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg group-hover:bg-gray-50 transition-colors">
          <Icon className="w-4 h-4 text-gray-400" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h2>
      </div>
      <span className="bg-gray-100 text-gray-600 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
        {count}
      </span>
      <div className="h-px bg-gray-100 flex-1 ml-4" />
    </div>
  );
}

// --- MAIN EXPLORER COMPONENT ---

export default function Explorer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ItemType>('all');
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(new Set());

  // Filtering Helpers
  const getItemsForDeal = (dealId: string) => MOCK_ITEMS.filter(i => i.dealId === dealId && (filter === 'all' || i.type === filter));
  const getItemsForPerson = (personId: string) => MOCK_ITEMS.filter(i => i.personId === personId && (filter === 'all' || i.type === filter));
  const getMyCommitments = () => MOCK_ITEMS.filter(i => i.owner === 'Me' && (i.type === 'promise' || i.type === 'action') && (filter === 'all' || filter === i.type));
  const getAllMetrics = () => MOCK_ITEMS.filter(i => i.type === 'metric' && (filter === 'all' || filter === 'metric'));

  const toggleCompanyCollapse = (id: string) => {
    const next = new Set(collapsedCompanies);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsedCompanies(next);
  };

  const activeDealsFiltered = MOCK_DEALS.filter(deal => {
      if (filter === 'all') return true;
      const items = getItemsForDeal(deal.id);
      return items.length > 0;
  });

  const recentPeopleFiltered = MOCK_PEOPLE.filter(person => {
      if (filter === 'all') return true;
      const items = getItemsForPerson(person.id);
      return items.length > 0;
  });

  const myCommitments = getMyCommitments();
  const allMetrics = getAllMetrics();

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        
        {/* EXPLORER HEADER */}
        <header className="pt-24 pb-8 sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-transparent transition-all">
          <div className="flex items-center justify-between mb-8">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Context Explorer</span>
             </div>

             <div className="flex bg-gray-100 p-1 rounded-full">
                <button 
                    onClick={() => onNavigate('brief')}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Brief
                </button>
                <button 
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 bg-white shadow-sm ring-1 ring-black/5"
                >
                    Explorer
                </button>
             </div>
          </div>

          <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2 text-black">
                    Explorer
                </h1>
                <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Last 14 days</span>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:shadow text-sm font-medium text-gray-700 transition-all">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span>{filter === 'all' ? 'All Content' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s Only`}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 p-1 hidden group-hover:block z-50">
                    {['all', 'promise', 'action', 'decision', 'metric'].map((opt) => (
                        <button 
                            key={opt}
                            onClick={() => setFilter(opt as any)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === opt ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {opt === 'all' ? 'All Items' : `${opt.charAt(0).toUpperCase() + opt.slice(1)}s`}
                        </button>
                    ))}
                </div>
              </div>
          </div>
        </header>

        {/* 1. ACTIVE DEALS PANEL */}
        <section>
          <SectionHeader title="Active Deals" count={activeDealsFiltered.length} icon={Briefcase} />
          {activeDealsFiltered.length === 0 ? (
             <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">No active deals found matching filter</div>
          ) : (
             <div className="space-y-4">
               {activeDealsFiltered.map(deal => {
                 const isExpanded = expandedDeal === deal.id;
                 const dealItems = getItemsForDeal(deal.id);
                 
                 const metrics = dealItems.filter(i => i.type === 'metric');
                 const mentions = dealItems.filter(i => i.type !== 'metric' && i.type !== 'decision');
                 const decisions = dealItems.filter(i => i.type === 'decision');

                 return (
                   <div key={deal.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-gray-300 hover:shadow-md">
                      <div 
                        onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                        className="p-5 cursor-pointer"
                      >
                         <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold font-serif text-gray-900">{deal.name}</h3>
                            <span className="text-xs font-mono font-bold text-gray-400">{deal.lastActivity}</span>
                         </div>
                         
                         <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                            <span>{deal.metricsCount} Metrics</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{deal.mentionsCount} Mentions</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{deal.decisionsCount} Decisions</span>
                         </div>

                         <div className="text-sm text-gray-600 font-medium truncate">
                            <span className="text-gray-400 mr-2">Latest:</span>
                            {deal.preview}
                         </div>
                      </div>

                      {isExpanded && (
                          <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-6">
                             {metrics.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Key Metrics ({metrics.length})</h4>
                                    <div className="space-y-2">
                                        {metrics.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                             )}

                             {decisions.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Decisions ({decisions.length})</h4>
                                    <div className="space-y-2">
                                        {decisions.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                             )}
                             
                             {mentions.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Context ({mentions.length})</h4>
                                    <div className="space-y-2">
                                        {mentions.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                             )}

                             {deal.introducedBy && (
                                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                    Introduced by: <span className="font-medium text-gray-600">{deal.introducedBy}</span>
                                </div>
                             )}
                          </div>
                      )}
                   </div>
                 );
               })}
             </div>
          )}
        </section>

        {/* 2. RECENT PEOPLE PANEL */}
        <section>
          <SectionHeader title="Recent People" count={recentPeopleFiltered.length} icon={Users} />
          {recentPeopleFiltered.length === 0 ? (
             <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">No interactions matching filter</div>
          ) : (
            <div className="space-y-4">
              {recentPeopleFiltered.map(person => {
                const isExpanded = expandedPerson === person.id;
                const items = getItemsForPerson(person.id);
                
                const iPromised = items.filter(i => i.type === 'promise' && i.owner === 'Me');
                const theyPromised = items.filter(i => i.type === 'promise' && i.owner !== 'Me');
                const actions = items.filter(i => i.type === 'action');
                const misc = items.filter(i => i.type !== 'promise' && i.type !== 'action');

                return (
                  <div key={person.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-gray-300 hover:shadow-md">
                     <div 
                        onClick={() => setExpandedPerson(isExpanded ? null : person.id)}
                        className="p-5 cursor-pointer"
                     >
                        <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-2">
                               <h3 className="text-lg font-bold font-serif text-gray-900">{person.name}</h3>
                               {person.isCandidate && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Candidate</span>}
                           </div>
                           <span className="text-xs font-mono font-bold text-gray-400">{person.interactionCount} interactions</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                            {person.email && <span>{person.email}</span>}
                            {person.email && person.handle && <span className="text-gray-300">•</span>}
                            {person.handle && <span className="font-medium text-blue-500">{person.handle}</span>}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                             <div className="flex items-center gap-2">
                                 <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{person.openItemsCount} open items</span>
                                 <span className="text-xs text-gray-400">Last: {person.lastInteractionType}</span>
                             </div>
                             <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                     </div>

                     {isExpanded && (
                        <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-6">
                            {iPromised.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-3">I Promised Them</h4>
                                    <div className="space-y-2">
                                        {iPromised.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                            )}

                            {theyPromised.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-3">They Promised Me</h4>
                                    <div className="space-y-2">
                                        {theyPromised.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                            )}

                            {actions.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-3">Action Items</h4>
                                    <div className="space-y-2">
                                        {actions.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                            )}

                            {misc.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Other Context</h4>
                                    <div className="space-y-2">
                                        {misc.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                                    </div>
                                </div>
                            )}
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. MY COMMITMENTS PANEL */}
        {(filter === 'all' || filter === 'promise' || filter === 'action') && (
            <section>
                <SectionHeader title="My Commitments" count={myCommitments.length} icon={CheckCircle} />
                {myCommitments.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">No pending commitments found</div>
                ) : (
                    <div className="space-y-3">
                        {myCommitments.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </section>
        )}

        {/* 4. METRICS OVERVIEW PANEL */}
        <section>
           <SectionHeader title="Metrics Overview" count={allMetrics.length} icon={BarChart} />
           {allMetrics.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">No metrics found in last 14 days</div>
            ) : (
                <div className="space-y-4">
                    {MOCK_COMPANIES.map(company => {
                        const companyMetrics = allMetrics.filter(m => m.companyId === company.id);
                        if (companyMetrics.length === 0) return null;
                        const isCollapsed = collapsedCompanies.has(company.id);

                        return (
                            <div key={company.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => toggleCompanyCollapse(company.id)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">{company.name}</span>
                                        <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-1.5 rounded">{companyMetrics.length}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                </button>
                                
                                {!isCollapsed && (
                                    <div className="p-4 space-y-2 bg-white">
                                        {companyMetrics.map(item => (
                                            <ItemCard key={item.id} item={item} compact />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {allMetrics.filter(m => !m.companyId).length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                             <div className="p-4 bg-gray-50 font-bold text-gray-900 text-sm">Ungrouped</div>
                             <div className="p-4 space-y-2 bg-white">
                                {allMetrics.filter(m => !m.companyId).map(item => (
                                    <ItemCard key={item.id} item={item} compact />
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}
