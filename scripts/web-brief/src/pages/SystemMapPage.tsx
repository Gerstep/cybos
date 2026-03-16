import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ZoomIn, ZoomOut, Maximize2, X, ArrowLeft } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────

interface NodeDetail {
  description?: string;
  agents?: string[];
  steps?: string[];
  fields?: string[];
  structure?: string[];
  stack?: string[];
  command?: string;
  output?: string;
}

interface MapNode {
  id: string;
  type: 'skill' | 'process' | 'data' | 'integration' | 'infra';
  title: string;
  desc: string;
  x: number;
  y: number;
  tags?: string[];
  connections: string[];
  group: string;
  detail?: NodeDetail;
}

interface Region {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cls: string;
}

type ViewType = 'all' | 'skills' | 'process' | 'data' | 'integration' | 'infra';
type FlowType = 'research' | 'content' | 'deal' | 'morning' | null;

// ── Data ─────────────────────────────────────────────────────

const nodes: MapNode[] = [
  // Skills
  { id: 'sk-research', type: 'skill', title: 'Research', desc: 'Company DD, tech/market analysis. 3 intensity levels: quick, standard, deep.', x: 40, y: 140, tags: ['4 agents', '3 modes'], connections: ['pr-research', 'dt-entities', 'dt-extracted', 'int-perplexity', 'int-exa'], group: 'skills',
    detail: { description: 'Automated research with parallel agent dispatch. Light mode for quick signals, medium for company + tech, deep for full market study with all 4 specialized agents.', agents: ['company-researcher', 'financial-researcher', 'tech-researcher', 'market-researcher'], output: '~/CybosVault/private/research/', command: '/cyber-research-company, /cyber-research-tech, /cyber-research-market' }},
  { id: 'sk-content', type: 'skill', title: 'Content', desc: 'Multi-channel content: essays, tweets, Telegram, images with brand voice.', x: 40, y: 280, tags: ['4 channels'], connections: ['pr-content', 'dt-vault', 'int-nano'], group: 'skills',
    detail: { description: 'Generates content across 4 channels following brand identity. Supports essays, tweets, Telegram posts, and AI-generated images.', agents: ['content-writer'], output: '~/CybosVault/private/content/', command: '/cyber-essay, /cyber-telegram, /cyber-image' }},
  { id: 'sk-writing', type: 'skill', title: 'Writing', desc: 'Iterative critique with 5 parallel judge subagents per section.', x: 40, y: 400, tags: ['5 judges'], connections: ['pr-critique', 'dt-vault'], group: 'skills',
    detail: { description: '6-phase workflow: Ingest, Critique (5 parallel judges), Synthesis, Present, Apply, Loop.', agents: ['practical-judge', 'data-freshness-judge', 'language-judge', 'substance-judge', 'completeness-judge'], output: 'In-place file edits', command: '/cyber-writing' }},
  { id: 'sk-ddmemo', type: 'skill', title: 'DD Memo', desc: 'Investment memo: Situation, Opportunity, Risks, Recommendation.', x: 40, y: 520, tags: ['2 agents'], connections: ['pr-deal', 'dt-entities', 'sk-research'], group: 'skills',
    detail: { description: 'Structured investment memo generation following cyber·Fund format.', agents: ['memo-analyst', 'memo-writer'], output: '~/CybosVault/private/research/', command: '/cyber-memo' }},
  { id: 'sk-telegram', type: 'skill', title: 'Telegram', desc: 'Read, draft, send messages via GramJS MTProto. Intro groups.', x: 40, y: 640, tags: ['MTProto'], connections: ['int-telegram', 'dt-interactions', 'pr-morning'], group: 'skills',
    detail: { description: 'Full Telegram integration via GramJS MTProto client.', agents: ['telegram-agent'], output: 'Telegram messages', command: '/cyber-telegram' }},
  { id: 'sk-gtd', type: 'skill', title: 'GTD', desc: 'Autonomous task execution from GTD.md with entity context.', x: 40, y: 760, tags: ['auto'], connections: ['pr-gtd', 'dt-entities', 'dt-vault'], group: 'skills',
    detail: { description: 'Reads GTD.md, queries database for entity context, executes tasks autonomously.', agents: ['gtd-executor'], output: 'Task completion + logs', command: '/cyber-gtd' }},
  { id: 'sk-browse', type: 'skill', title: 'Browse', desc: 'Twitter timeline scanning for trending topics and content ideas.', x: 40, y: 870, tags: ['Twitter'], connections: ['int-playwright', 'sk-content'], group: 'skills',
    detail: { description: 'Scans Twitter via Playwright browser automation to discover trending topics.', agents: ['content-scout'], output: 'Content ideas list', command: '/cyber-browse' }},
  { id: 'sk-summarize', type: 'skill', title: 'Summarize', desc: 'Transcript summarization for therapy, meetings, documents.', x: 40, y: 970, tags: ['transcripts'], connections: ['dt-vault', 'inf-granola'], group: 'skills',
    detail: { description: 'Processes transcript types into structured notes.', agents: ['summarizer'], output: '~/CybosVault/private/', command: '/cyber-summarize' }},
  { id: 'sk-narrative', type: 'skill', title: 'Narrative Engine', desc: 'Transform content into presentations or prose via storytelling frameworks.', x: 40, y: 1070, tags: ['frameworks'], connections: ['sk-content', 'dt-vault'], group: 'skills',
    detail: { description: 'Uses storytelling frameworks to transform content into presentations or prose.', agents: ['narrator'], output: 'Presentations / prose', command: '/narrative-engine' }},
  { id: 'sk-positioning', type: 'skill', title: 'Positioning', desc: 'Structured positioning statement exercise for founders.', x: 40, y: 1170, tags: ['strategy'], connections: ['sk-research', 'dt-entities'], group: 'skills',
    detail: { description: 'Guides companies through competitive research and strategic questioning.', agents: ['positioning-strategist'], output: 'Positioning document', command: '/cyber-positioning' }},
  { id: 'sk-brief', type: 'skill', title: 'Morning Brief', desc: 'Daily digest: Telegram, email, calendar, GTD context.', x: 40, y: 1270, tags: ['daily'], connections: ['pr-morning', 'sk-telegram', 'int-gmail', 'inf-calendar'], group: 'skills',
    detail: { description: 'Aggregates Telegram, emails, calendar events, and GTD tasks into a morning briefing.', agents: [], output: 'Brief summary', command: '/cyber-brief' }},
  { id: 'sk-email', type: 'skill', title: 'Email', desc: 'Gmail processing: read, draft, save attachments to deals.', x: 40, y: 1370, tags: ['Gmail'], connections: ['int-gmail', 'dt-vault', 'dt-entities'], group: 'skills',
    detail: { description: 'Processes Gmail messages, drafts replies, saves attachments to deal folders.', agents: [], output: 'Email drafts / attachments', command: '/cyber-email' }},
  { id: 'sk-design', type: 'skill', title: 'Design Taste', desc: 'Web design critique and improvement. Enforces metric-based rules.', x: 40, y: 1470, tags: ['UI/UX'], connections: ['inf-web', 'int-playwright'], group: 'skills',
    detail: { description: 'Senior UI/UX engineering skill overriding default LLM biases.', agents: ['design-judge'], output: 'Design feedback / code', command: '/design-taste-frontend' }},

  // Processes
  { id: 'pr-research', type: 'process', title: 'Research Pipeline', desc: 'Light > Medium > Deep. Parallel agent dispatch with synthesis.', x: 320, y: 180, tags: ['parallel'], connections: ['dt-entities', 'dt-extracted', 'dt-vault'], group: 'process',
    detail: { description: 'Three intensity levels with parallel agent dispatch. Results synthesized into single report.', steps: ['Trigger via /cyber-research', 'Select intensity level', 'Dispatch agents in parallel', 'Gather agent reports', 'Synthesize into unified report', 'Save to ~/CybosVault/private/research/'] }},
  { id: 'pr-content', type: 'process', title: 'Content Pipeline', desc: 'Identity load > Draft > Review > Schedule via Typefully.', x: 320, y: 370, tags: ['multi-channel'], connections: ['dt-vault', 'inf-typefully'], group: 'process',
    detail: { description: 'Loads brand identity, generates draft, enables review, and schedules via Typefully.', steps: ['Load identity.md + writing-style', 'Generate draft', 'Review and iterate', 'Schedule via /cyber-schedule'] }},
  { id: 'pr-critique', type: 'process', title: 'Critique Loop', desc: '5 judges > Synthesis > Present > Apply per section.', x: 320, y: 510, tags: ['iterative'], connections: ['dt-vault'], group: 'process',
    detail: { description: '6-phase iterative improvement with 5 parallel judges per section.', steps: ['Parse content into sections', 'Launch 5 judge agents per section', 'Collect and deduplicate findings', 'Present proposals to user', 'Apply approved changes', 'Move to next section'] }},
  { id: 'pr-deal', type: 'process', title: 'Deal Pipeline', desc: 'Init > Research > Memo > IC Decision. Full deal lifecycle.', x: 320, y: 650, tags: ['lifecycle'], connections: ['dt-entities', 'dt-vault', 'sk-research', 'sk-ddmemo'], group: 'process',
    detail: { description: 'Complete deal lifecycle management from init to IC decision.', steps: ['/cyber-init-deal creates folder', 'Research company (light to deep)', 'Generate DD Memo', 'IC review and decision'] }},
  { id: 'pr-gtd', type: 'process', title: 'Task Execution', desc: 'Read GTD.md > Context lookup > Execute > Log.', x: 320, y: 790, tags: ['autonomous'], connections: ['dt-vault', 'dt-entities', 'inf-logs'], group: 'process',
    detail: { description: 'Autonomous task runner with entity context lookup and logging.', steps: ['Read GTD.md', 'Query database for entity context', 'Execute next task', 'Log results'] }},
  { id: 'pr-morning', type: 'process', title: 'Morning Routine', desc: 'Telegram + Email + Calendar + GTD > Unified brief.', x: 320, y: 930, tags: ['aggregation'], connections: ['sk-telegram', 'sk-email', 'inf-calendar', 'sk-gtd'], group: 'process',
    detail: { description: 'Aggregates all morning inputs into a single actionable brief.', steps: ['Fetch Telegram messages', 'Check Gmail inbox', 'Load calendar events', 'Read GTD tasks', 'Synthesize into brief'] }},
  { id: 'pr-reindex', type: 'process', title: 'Reindex Pipeline', desc: 'Extract from all sources > LLM processing > SQLite rebuild.', x: 320, y: 1070, tags: ['batch'], connections: ['dt-sqlite', 'dt-extracted', 'inf-granola', 'dt-entities', 'dt-interactions'], group: 'process',
    detail: { description: 'Rebuilds the context graph database. Uses claude-haiku-4-5 for LLM extraction.', steps: ['Run extractors: calls, deals, emails, entities, telegram', 'LLM extraction via claude-haiku-4-5', 'Populate entities, interactions, extracted_items', 'Rebuild full-text search indexes'] }},

  // Data
  { id: 'dt-entities', type: 'data', title: 'Entities', desc: 'Companies, people, funds, deals, tech. 7 entity types with aliases.', x: 600, y: 200, tags: ['7 types', 'FTS5'], connections: ['dt-sqlite', 'dt-interactions'], group: 'data',
    detail: { description: 'Core entity types: company, person, fund, deal, tech, framework, metric. Full-text search via SQLite FTS5.', fields: ['id, name, slug', 'type (7 enum values)', 'description', 'metadata (JSON)', 'created_at, updated_at'] }},
  { id: 'dt-interactions', type: 'data', title: 'Interactions', desc: 'Entity relationships: mentions, uses, competes, partners, funds.', x: 600, y: 360, tags: ['6 types', 'strength 1-5'], connections: ['dt-sqlite', 'dt-entities'], group: 'data',
    detail: { description: 'Captures relationships between entities with strength (1-5).', fields: ['entity_a_id, entity_b_id', 'interaction_type (6 values)', 'strength (1-5)', 'context, source, date'] }},
  { id: 'dt-extracted', type: 'data', title: 'Extracted Items', desc: 'Claims, insights, signals, deal news from calls, emails, tweets.', x: 600, y: 510, tags: ['4 sources', '4 types'], connections: ['dt-sqlite'], group: 'data',
    detail: { description: 'Intelligence items extracted via LLM from various sources.', fields: ['source_type (call, email, tweet, document)', 'item_type (claim, insight, signal, deal_news)', 'content, metadata'] }},
  { id: 'dt-sqlite', type: 'data', title: 'SQLite DB', desc: '5 tables with FTS5 full-text search. Context graph engine.', x: 600, y: 660, tags: ['FTS5', '5 tables'], connections: [], group: 'data',
    detail: { description: 'Local SQLite database powering the context graph. 5 tables with full-text search.', fields: ['entities + entity_aliases', 'interactions', 'extracted_items', 'batch_runs'] }},
  { id: 'dt-vault', type: 'data', title: 'Vault Files', desc: 'Structured storage: deals, research, content, sessions, logs.', x: 600, y: 810, tags: ['~/CybosVault'], connections: ['dt-sqlite'], group: 'data',
    detail: { description: 'Persistent file storage at ~/CybosVault/private/.', structure: ['deals/<slug>/index.md + research/', 'research/MMDD-<slug>-YY.md', 'content/{essays,tweets,posts,images}/', 'context/{identity,sessions,style}/', 'projects/<slug>/.cybos/context.md + GTD.md'] }},

  // Integrations
  { id: 'int-perplexity', type: 'integration', title: 'Perplexity', desc: 'Web search, research, reasoning with citations.', x: 870, y: 140, tags: ['MCP'], connections: [], group: 'integration', detail: { description: '4 tools: search, ask, research, reason. Supports recency filters.' }},
  { id: 'int-exa', type: 'integration', title: 'Exa', desc: 'Semantic web search and code context retrieval.', x: 870, y: 260, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Semantic search and code-aware search.' }},
  { id: 'int-parallel', type: 'integration', title: 'Parallel Search', desc: 'Batch web searches and URL content extraction.', x: 870, y: 380, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Batch web searches and multi-URL content extraction.' }},
  { id: 'int-firecrawl', type: 'integration', title: 'Firecrawl', desc: 'Web scraping, crawling, extraction, browser automation.', x: 870, y: 500, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Advanced web data extraction: scrape, crawl, extract, map.' }},
  { id: 'int-playwright', type: 'integration', title: 'Playwright', desc: 'Browser automation for scraping and testing.', x: 870, y: 620, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Full browser automation. Navigate, click, fill, screenshot.' }},
  { id: 'int-nano', type: 'integration', title: 'Nano Banana', desc: 'AI image generation and editing via Gemini.', x: 870, y: 740, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Image generation using Gemini: generate, edit, continue.' }},
  { id: 'int-gmail', type: 'integration', title: 'Gmail', desc: 'Email & calendar integration. Send, search, events.', x: 870, y: 860, tags: ['MCP'], connections: [], group: 'integration', detail: { description: 'Gmail and Google Calendar: emails, replies, calendar events.' }},
  { id: 'int-telegram', type: 'integration', title: 'GramJS', desc: 'Telegram MTProto client for direct message access.', x: 870, y: 980, tags: ['MTProto'], connections: [], group: 'integration', detail: { description: 'Direct Telegram client via GramJS MTProto protocol.' }},

  // Infrastructure
  { id: 'inf-hooks', type: 'infra', title: 'Hooks', desc: 'SessionStart loads context, checks DB, rebuilds index.', x: 1120, y: 200, tags: ['auto'], connections: ['dt-sqlite', 'inf-granola'], group: 'infra', detail: { description: 'SessionStart: loads identity, fund context, checks DB freshness, rebuilds index on CC version change. Stop: cleanup and session persistence.' }},
  { id: 'inf-granola', type: 'infra', title: 'Granola', desc: 'Call transcript extraction via REST API. 635+ calls indexed.', x: 1120, y: 370, tags: ['API', '635 calls'], connections: ['dt-extracted', 'dt-sqlite'], group: 'infra', detail: { description: 'Extracts meeting transcripts from Granola API (api.granola.ai/v1) with WorkOS token auth.' }},
  { id: 'inf-web', type: 'infra', title: 'Web Brief UI', desc: 'React SPA: entity explorer, agent dashboard, call viewer.', x: 1120, y: 540, tags: ['React', 'Hono'], connections: ['dt-sqlite', 'dt-entities'], group: 'infra', detail: { description: 'React SPA on localhost:3847. Explorer, Setup, Agent Dashboard, Call Transcript, Entity Details.', stack: ['React 18 + TypeScript', 'Tailwind CSS 3', 'Vite 6', 'Hono (backend)', 'Lucide React'] }},
  { id: 'inf-calendar', type: 'infra', title: 'Calendar', desc: 'Google Calendar queries for morning brief schedule.', x: 1120, y: 680, tags: ['Google'], connections: ['int-gmail'], group: 'infra', detail: { description: 'Queries Google Calendar for upcoming meetings via Gmail MCP server.' }},
  { id: 'inf-logs', type: 'infra', title: 'Logging', desc: 'Workflow logs with duration, agents used, and output paths.', x: 1120, y: 810, tags: ['daily logs'], connections: ['dt-vault'], group: 'infra', detail: { description: 'All workflows log to ~/CybosVault/private/.cybos/logs/MMDD-YY.md.' }},
  { id: 'inf-typefully', type: 'infra', title: 'Typefully', desc: 'Schedule content to Twitter and LinkedIn.', x: 1120, y: 940, tags: ['scheduling'], connections: ['sk-content'], group: 'infra', detail: { description: 'Content scheduling for Twitter/LinkedIn via /cyber-schedule.' }},
];

const flows: Record<string, string[]> = {
  research: ['sk-research', 'pr-research', 'int-perplexity', 'int-exa', 'int-parallel', 'dt-entities', 'dt-extracted', 'dt-vault', 'dt-sqlite'],
  content: ['sk-content', 'sk-browse', 'pr-content', 'sk-writing', 'pr-critique', 'int-nano', 'int-playwright', 'dt-vault', 'inf-typefully'],
  deal: ['sk-research', 'sk-ddmemo', 'pr-deal', 'pr-research', 'dt-entities', 'dt-vault', 'dt-sqlite', 'dt-extracted'],
  morning: ['sk-brief', 'pr-morning', 'sk-telegram', 'sk-email', 'sk-gtd', 'int-gmail', 'int-telegram', 'inf-calendar', 'dt-vault'],
};

const regions: Region[] = [
  { id: 'skills', label: 'Skills (14)', x: 20, y: 100, w: 240, h: 1440, cls: 'skills' },
  { id: 'process', label: 'Processes (7)', x: 298, y: 140, w: 240, h: 1010, cls: 'process' },
  { id: 'data', label: 'Data Layer (5)', x: 578, y: 160, w: 240, h: 730, cls: 'data' },
  { id: 'integration', label: 'MCP Integrations (8)', x: 848, y: 100, w: 240, h: 930, cls: 'integration' },
  { id: 'infra', label: 'Infrastructure (6)', x: 1098, y: 160, w: 240, h: 850, cls: 'infra' },
];

const BADGE_COLORS: Record<string, string> = {
  skill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  process: 'bg-blue-50 text-blue-700 border border-blue-200',
  data: 'bg-amber-50 text-amber-700 border border-amber-200',
  integration: 'bg-purple-50 text-purple-700 border border-purple-200',
  infra: 'bg-red-50 text-red-700 border border-red-200',
};

const REGION_COLORS: Record<string, string> = {
  skills: 'border-emerald-400/30 bg-emerald-50/20',
  process: 'border-blue-400/30 bg-blue-50/20',
  data: 'border-amber-400/30 bg-amber-50/20',
  integration: 'border-purple-400/30 bg-purple-50/20',
  infra: 'border-red-400/30 bg-red-50/20',
};

const FLOW_COLORS: Record<string, string> = {
  research: '#059669',
  content: '#d97706',
  deal: '#dc2626',
  morning: '#2563eb',
};

const DOT_COLORS: Record<string, string> = {
  skill: '#059669',
  process: '#2563eb',
  data: '#ca8a04',
  integration: '#7c3aed',
  infra: '#dc2626',
};

// ── Components ───────────────────────────────────────────────

interface Props {
  onNavigate?: (page: string) => void;
}

export function SystemMapPage({ onNavigate }: Props) {
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [currentFlow, setCurrentFlow] = useState<FlowType>(null);
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom on mount
  useEffect(() => {
    if (scrollRef.current) {
      const w = scrollRef.current.clientWidth;
      const h = scrollRef.current.clientHeight;
      const z = Math.min(w / 1500, h / 1650, 1);
      setZoom(Math.round(z * 100) / 100);
    }
  }, []);

  const handleSetView = useCallback((view: ViewType) => {
    setCurrentView(view);
    setCurrentFlow(null);
  }, []);

  const handleSetFlow = useCallback((flow: FlowType) => {
    setCurrentFlow(prev => prev === flow ? null : flow);
    setCurrentView('all');
  }, []);

  const isNodeVisible = useCallback((node: MapNode) => {
    if (currentFlow && flows[currentFlow]) {
      return flows[currentFlow].includes(node.id);
    }
    if (currentView !== 'all') {
      return node.group === currentView;
    }
    return true;
  }, [currentView, currentFlow]);

  const isSearchMatch = useCallback((node: MapNode) => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return node.title.toLowerCase().includes(q) || node.desc.toLowerCase().includes(q);
  }, [searchQuery]);

  const isConnectionHighlighted = useCallback((fromId: string, toId: string) => {
    if (!currentFlow || !flows[currentFlow]) return false;
    return flows[currentFlow].includes(fromId) && flows[currentFlow].includes(toId);
  }, [currentFlow]);

  // SVG connections
  const renderConnections = () => {
    const paths: React.ReactNode[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return;
        const x1 = node.x + 100, y1 = node.y + 40;
        const x2 = target.x + 100, y2 = target.y + 40;
        const midX = (x1 + x2) / 2;
        const highlighted = isConnectionHighlighted(node.id, targetId);
        const color = highlighted && currentFlow ? FLOW_COLORS[currentFlow] : '#c8d6d4';
        paths.push(
          <path
            key={`${node.id}-${targetId}`}
            d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={highlighted ? 2.5 : 1.5}
            strokeDasharray={highlighted ? 'none' : '6 4'}
            opacity={highlighted ? 0.9 : 0.5}
          />
        );
      });
    });
    return paths;
  };

  return (
    <div className="h-screen flex bg-white text-gray-900">
      {/* Sidebar */}
      <div className="w-[260px] min-w-[260px] border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-hidden">
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button onClick={() => onNavigate('brief')} className="p-1 -ml-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-semibold text-gray-900 tracking-tight">System Map</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">cyberman architecture</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 px-2 mb-2">Views</div>
            {([
              { view: 'all' as ViewType, label: 'Full System Map', color: '#233534' },
              { view: 'skills' as ViewType, label: 'Skills', color: '#059669', count: 14 },
              { view: 'process' as ViewType, label: 'Processes', color: '#2563eb', count: 7 },
              { view: 'data' as ViewType, label: 'Data Ontology', color: '#ca8a04', count: 5 },
              { view: 'integration' as ViewType, label: 'Integrations', color: '#7c3aed', count: 8 },
              { view: 'infra' as ViewType, label: 'Infrastructure', color: '#dc2626', count: 6 },
            ]).map(item => (
              <button
                key={item.view}
                onClick={() => handleSetView(item.view)}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  currentView === item.view && !currentFlow ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                {item.label}
                {item.count && (
                  <span className="ml-auto text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 px-2 mb-2">Workflows</div>
            {([
              { flow: 'research' as FlowType, label: 'Research Flow', color: '#059669' },
              { flow: 'content' as FlowType, label: 'Content Flow', color: '#d97706' },
              { flow: 'deal' as FlowType, label: 'Deal Pipeline', color: '#dc2626' },
              { flow: 'morning' as FlowType, label: 'Morning Brief', color: '#2563eb' },
            ]).map(item => (
              <button
                key={item.flow}
                onClick={() => handleSetFlow(item.flow)}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  currentFlow === item.flow ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Legend</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(DOT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-medium bg-white text-gray-900 w-48 outline-none focus:border-emerald-400 transition-colors placeholder:text-gray-300"
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-1.5 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-colors text-gray-400">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-semibold text-gray-400 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1.5 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-colors text-gray-400">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (scrollRef.current) {
                  const w = scrollRef.current.clientWidth;
                  const h = scrollRef.current.clientHeight;
                  setZoom(Math.round(Math.min(w / 1500, h / 1650, 1) * 100) / 100);
                  scrollRef.current.scrollTo(0, 0);
                }
              }}
              className="p-1.5 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-colors text-gray-400"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable canvas */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div
            ref={canvasRef}
            className="relative"
            style={{ width: 1500, height: 1650, transform: `scale(${zoom})`, transformOrigin: '0 0' }}
          >
            {/* SVG connections */}
            <svg className="absolute inset-0 pointer-events-none" width={1500} height={1650} style={{ overflow: 'visible' }}>
              {renderConnections()}
            </svg>

            {/* Regions */}
            {regions.map(r => (
              <React.Fragment key={r.id}>
                <div
                  className={`absolute border-[1.5px] border-dashed rounded-[20px] pointer-events-none transition-opacity ${REGION_COLORS[r.cls]} ${
                    (currentView === r.id || currentView === 'all') ? 'opacity-70' : 'opacity-30'
                  }`}
                  style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                />
                <div className="absolute" style={{ left: r.x + 16, top: r.y - 22 }}>
                  <span className="font-serif text-[14px] font-semibold text-gray-400/50 tracking-wide">{r.label}</span>
                </div>
              </React.Fragment>
            ))}

            {/* Nodes */}
            {nodes.map(node => {
              const visible = isNodeVisible(node);
              const matched = isSearchMatch(node);
              const isActive = activeNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(isActive ? null : node)}
                  className={`absolute bg-white border rounded-xl px-3.5 py-3 cursor-pointer transition-all max-w-[200px] min-w-[150px] ${
                    isActive
                      ? 'border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.12)] shadow-lg z-10'
                      : matched
                        ? 'border-amber-300 shadow-[0_0_0_3px_rgba(185,146,46,0.15)] z-10'
                        : visible
                          ? 'border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 z-[1]'
                          : 'border-gray-100 opacity-20 z-[1]'
                  }`}
                  style={{ left: node.x, top: node.y }}
                >
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded mb-2 ${BADGE_COLORS[node.type]}`}>
                    {node.type}
                  </span>
                  <div className="text-[13px] font-semibold text-gray-900 mb-1 leading-tight">{node.title}</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{node.desc}</div>
                  {node.tags && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {node.tags.map(t => (
                        <span key={t} className="text-[9px] font-mono font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className={`fixed right-0 top-0 h-screen w-[380px] bg-white border-l border-gray-100 shadow-[-8px_0_30px_rgba(0,0,0,0.06)] z-50 transition-transform duration-200 ${
        activeNode ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {activeNode && (
          <>
            <button
              onClick={() => setActiveNode(null)}
              className="absolute top-4 right-4 p-1.5 border border-gray-200 rounded-md bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded mb-2 ${BADGE_COLORS[activeNode.type]}`}>
                {activeNode.type}
              </span>
              <h2 className="font-serif text-xl font-semibold">{activeNode.title}</h2>
            </div>
            <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <DetailSection title="Description">
                <p className="text-[13px] leading-relaxed text-gray-700 break-words">
                  {activeNode.detail?.description || activeNode.desc}
                </p>
              </DetailSection>

              {activeNode.detail?.agents && activeNode.detail.agents.length > 0 && (
                <DetailSection title="Agents">
                  {activeNode.detail.agents.map(a => (
                    <div key={a} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-[12px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{a}
                    </div>
                  ))}
                </DetailSection>
              )}

              {activeNode.detail?.steps && activeNode.detail.steps.length > 0 && (
                <DetailSection title="Steps">
                  {activeNode.detail.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0 text-[12px] text-gray-700">
                      <span className="text-[9px] font-mono font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </DetailSection>
              )}

              {activeNode.detail?.fields && activeNode.detail.fields.length > 0 && (
                <DetailSection title="Schema Fields">
                  {activeNode.detail.fields.map((f, i) => (
                    <div key={i} className="py-1.5 border-b border-gray-50 last:border-0 text-[11px] font-mono text-gray-500">{f}</div>
                  ))}
                </DetailSection>
              )}

              {activeNode.detail?.structure && activeNode.detail.structure.length > 0 && (
                <DetailSection title="File Structure">
                  {activeNode.detail.structure.map((s, i) => (
                    <div key={i} className="py-1.5 border-b border-gray-50 last:border-0 text-[11px] font-mono text-gray-500">{s}</div>
                  ))}
                </DetailSection>
              )}

              {activeNode.detail?.stack && activeNode.detail.stack.length > 0 && (
                <DetailSection title="Tech Stack">
                  {activeNode.detail.stack.map((s, i) => (
                    <div key={i} className="py-1.5 border-b border-gray-50 last:border-0 text-[12px] text-gray-700">{s}</div>
                  ))}
                </DetailSection>
              )}

              {activeNode.detail?.command && (
                <DetailSection title="Commands">
                  <div className="text-[11px] font-mono text-emerald-600 bg-gray-50 px-3 py-2 rounded-lg break-all">{activeNode.detail.command}</div>
                </DetailSection>
              )}

              {activeNode.detail?.output && (
                <DetailSection title="Output">
                  <div className="text-[12px] font-mono text-gray-500">{activeNode.detail.output}</div>
                </DetailSection>
              )}

              {/* Connected nodes */}
              {(() => {
                const connected = nodes.filter(n =>
                  activeNode.connections.includes(n.id) || n.connections.includes(activeNode.id)
                );
                if (connected.length === 0) return null;
                return (
                  <DetailSection title="Connected To">
                    {connected.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setActiveNode(c)}
                        className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-[12px] text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: DOT_COLORS[c.type] }} />
                        {c.title}
                      </div>
                    ))}
                  </DetailSection>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{title}</div>
      {children}
    </div>
  );
}
