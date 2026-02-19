import React, { useState } from 'react';

// ── Data ──────────────────────────────────────────────────

const vitalSigns = [
  {
    label: 'Revenue Agents',
    value: '~8',
    delta: 'of 890+ registered',
    color: 'var(--dot-green)',
    note: 'Across 8004scan + x402scan',
  },
  {
    label: 'x402 API Revenue',
    value: '$565K+',
    delta: 'AInalyst $350K + Canza $215K',
    color: 'var(--dot-green)',
    note: 'Invisible in Composer UI',
  },
  {
    label: 'Composer Tool Calls (30d)',
    value: '3,874',
    delta: 'SniperX family = 70%+',
    color: 'var(--dot-gold)',
    note: 'Only 13 agents had any calls',
  },
  {
    label: 'Dead Agents',
    value: '90%+',
    delta: 'Zero tool calls in 30d',
    color: 'var(--dot-red)',
    note: 'Residual users from launch hype',
  },
];

type Verdict = 'REAL BUSINESS' | 'REAL UTILITY' | 'B2B INFRA' | 'TOKEN PLAY' | 'HIDDEN REVENUE' | 'ACCELERATING' | 'DECLINING' | 'EXPLOSIVE' | 'STEADY' | 'NOVEL' | 'EARLY';

interface Agent {
  rank: number;
  name: string;
  source: '8004' | 'x402' | 'both';
  model: string;
  keyMetric: string;
  revenue: string;
  growth: 'up' | 'down' | 'flat' | 'new';
  token: string;
  verdict: Verdict;
}

const tier1Agents: Agent[] = [
  {
    rank: 1,
    name: 'AInalyst Agent',
    source: 'x402',
    model: 'Data intelligence per-query',
    keyMetric: '493K x402 transactions',
    revenue: '~$350K+ (API)',
    growth: 'flat',
    token: '$AIN',
    verdict: 'HIDDEN REVENUE',
  },
  {
    rank: 2,
    name: 'Canza',
    source: 'x402',
    model: 'Analytics per-query',
    keyMetric: '434K x402 transactions',
    revenue: '~$215K+ (API)',
    growth: 'flat',
    token: '—',
    verdict: 'HIDDEN REVENUE',
  },
  {
    rank: 3,
    name: 'ZyfAI',
    source: '8004',
    model: 'Yield optimization fees',
    keyMetric: '$10.4M TVL · $1.5B rebalanced',
    revenue: 'Platform fees → $ZFI buyback',
    growth: 'up',
    token: '$ZFI',
    verdict: 'REAL BUSINESS',
  },
  {
    rank: 4,
    name: 'SniperX Family',
    source: 'x402',
    model: 'DeFi analytics $0.01–$0.10',
    keyMetric: '2,973 tool calls (30d)',
    revenue: '~$193/mo Composer + API',
    growth: 'up',
    token: '$SXAI',
    verdict: 'ACCELERATING',
  },
  {
    rank: 5,
    name: 'Otto AI',
    source: '8004',
    model: 'ACP agent fees + tx fees',
    keyMetric: '41.5% ACP market share',
    revenue: '$1.5K/2wk → buyback & burn',
    growth: 'up',
    token: '$OTTO',
    verdict: 'REAL BUSINESS',
  },
  {
    rank: 6,
    name: 'Invariant',
    source: '8004',
    model: 'x402 per-query ($0.50)',
    keyMetric: 'Smart contract auditor',
    revenue: '$0.50/query USDC',
    growth: 'flat',
    token: '—',
    verdict: 'REAL UTILITY',
  },
  {
    rank: 7,
    name: '[t54] x402-secure',
    source: 'x402',
    model: 'Trust scoring $0.01/call',
    keyMetric: '14,116 all-time tool calls',
    revenue: '~$141 Composer + facilitator share',
    growth: 'down',
    token: '—',
    verdict: 'DECLINING',
  },
  {
    rank: 8,
    name: 'BotPay',
    source: 'x402',
    model: 'NFT minting $1.00/call',
    keyMetric: '121 tool calls in 15 days',
    revenue: '~$35+ Composer',
    growth: 'new',
    token: '—',
    verdict: 'EXPLOSIVE',
  },
];

const tier2Agents: Agent[] = [
  {
    rank: 9,
    name: 'Minara AI',
    source: '8004',
    model: 'x402 per-query',
    keyMetric: '133 feedback · DMind + Circle',
    revenue: 'Micropayments USDC',
    growth: 'flat',
    token: '—',
    verdict: 'REAL UTILITY',
  },
  {
    rank: 10,
    name: 'Clawdia / ClawPlaza',
    source: '8004',
    model: 'Marketplace fees',
    keyMetric: '596 feedback · Agent labor market',
    revenue: 'NFT sales + marketplace fees',
    growth: 'flat',
    token: '— (explicitly none)',
    verdict: 'NOVEL',
  },
  {
    rank: 11,
    name: 'Silverback',
    source: 'both',
    model: 'x402 API fees',
    keyMetric: '80 tool calls (30d) · 2 chains',
    revenue: 'Pay-per-use B2B',
    growth: 'flat',
    token: '$BACK',
    verdict: 'B2B INFRA',
  },
  {
    rank: 12,
    name: 'Agent8',
    source: '8004',
    model: 'TBD',
    keyMetric: '1,175 feedback · Reputation layer',
    revenue: 'Unclear',
    growth: 'flat',
    token: '—',
    verdict: 'EARLY',
  },
  {
    rank: 13,
    name: 'Agent to Human Bridge',
    source: 'x402',
    model: 'Human-in-the-loop $0.02–$2',
    keyMetric: '443 all-time tool calls',
    revenue: '~$5–10/mo Composer',
    growth: 'flat',
    token: '—',
    verdict: 'NOVEL',
  },
];

const observations = [
  {
    title: 'API-first agents are invisible.',
    body: 'AInalyst ($350K) and Canza ($215K) generate 99%+ of revenue via direct x402 API calls, not Composer. The leaderboard systematically underweights B2B agents. Real revenue is off-screen.',
  },
  {
    title: 'SniperX is the breakout story.',
    body: 'A 1-month-old DeFi analytics suite generating 70%+ of all Composer tool calls — 2,973 in 30 days across 5 sub-agents. Growth is 13x from week 1 to week 4. The only agent with clear product-market fit acceleration.',
  },
  {
    title: 'Leaderboard score ≠ business value.',
    body: '8004scan\'s #1 agent (James) is a chatbot with no business model. ZyfAI (#30) has $10.4M TVL. The scoring algorithm rewards activity and protocol compliance, not fundamentals.',
  },
  {
    title: 'x402 micropayments are the working model.',
    body: 'Every agent with real revenue monetizes via pay-per-use USDC: Invariant at $0.50/query, SniperX at $0.01–$0.10, BotPay at $1.00 for NFT mints. This is agent-native SaaS.',
  },
  {
    title: 'Tokens are usually red flags.',
    body: 'The best utility agents (Invariant, ClawPlaza, Agent8, Minara AI) have no token. Projects with tokens ($GEKKO down 98%, $OTTO $580K mcap) are generally speculative. If an agent needs a token, ask: "Would it work better without one?"',
  },
  {
    title: 'Same-owner spam is rampant.',
    body: 'At least 3 wallets registered 4+ agents each to farm 8004scan rankings: Destiny/Simon/Stella/Dora (ranks 8,14,18,19), Gekko family (ranks 10,16,17), James/Rick (ranks 1,3). 37% of the 8004scan top 40 is filler or spam.',
  },
];

const priceTiers = [
  { tier: '$1.00+', agent: 'BotPay (NFT mint)', type: 'Premium transactions' },
  { tier: '$0.50', agent: 'Invariant (audit)', type: 'Professional B2B' },
  { tier: '$0.10', agent: 'SniperX (rankings)', type: 'High-value analytics' },
  { tier: '$0.01–$0.05', agent: 'SniperX (basic), t54', type: 'Commodity data' },
  { tier: '< $0.01', agent: 'Minifetch, various', type: 'Near-free tier' },
];

// ── Helpers ──────────────────────────────────────────────

const growthIcon = (g: Agent['growth']) => {
  switch (g) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'flat': return '→';
    case 'new': return '★';
  }
};

const growthColor = (g: Agent['growth']) => {
  switch (g) {
    case 'up': return 'text-emerald-600';
    case 'down': return 'text-red-500';
    case 'flat': return 'text-slate-400';
    case 'new': return 'text-amber-500';
  }
};

const verdictColor = (v: Verdict) => {
  switch (v) {
    case 'REAL BUSINESS':
    case 'REAL UTILITY':
    case 'B2B INFRA':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ACCELERATING':
    case 'EXPLOSIVE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'HIDDEN REVENUE':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'DECLINING':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'NOVEL':
    case 'EARLY':
    case 'STEADY':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const sourceLabel = (s: Agent['source']) => {
  switch (s) {
    case '8004': return '8004scan';
    case 'x402': return 'x402scan';
    case 'both': return 'Both';
  }
};

// ── Components ───────────────────────────────────────────

const VitalSign: React.FC<{
  label: string;
  value: string;
  delta: string;
  color: string;
}> = ({ label, value, delta, color }) => (
  <div className="rule-b">
    <div className="flex items-baseline justify-between py-4">
      <div className="flex items-baseline gap-3">
        <span className="serif ink text-[28px] leading-[1.15]">{label}</span>
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: color, transform: 'translateY(0.06em)' }}
        />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="serif ink text-[28px]">{value}</span>
        <span className="muted text-[14px] hidden sm:inline">{delta}</span>
      </div>
    </div>
  </div>
);

const AgentRow: React.FC<{ agent: Agent }> = ({ agent }) => (
  <tr className="border-b border-[var(--rule)] hover:bg-[#FAFBFB] transition-colors">
    <td className="py-3 pr-3 text-[13px] text-slate-400 font-mono">{agent.rank}</td>
    <td className="py-3 pr-4">
      <div className="flex items-center gap-2">
        <span className="ink font-medium text-[15px]">{agent.name}</span>
        <span className={`text-[11px] ${growthColor(agent.growth)}`}>{growthIcon(agent.growth)}</span>
      </div>
      <span className="text-[11px] text-slate-400">{sourceLabel(agent.source)}</span>
    </td>
    <td className="py-3 pr-4 text-[13px] muted hidden md:table-cell">{agent.model}</td>
    <td className="py-3 pr-4 text-[13px] ink hidden lg:table-cell">{agent.keyMetric}</td>
    <td className="py-3 pr-4 text-[13px] ink font-mono whitespace-nowrap">{agent.revenue}</td>
    <td className="py-3 pr-4 text-[12px] text-slate-400 hidden md:table-cell">{agent.token}</td>
    <td className="py-3">
      <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${verdictColor(agent.verdict)}`}>
        {agent.verdict}
      </span>
    </td>
  </tr>
);

// ── Page ─────────────────────────────────────────────────

export const AgentReportPage: React.FC = () => {
  const [expandedObs, setExpandedObs] = useState<number | null>(null);

  return (
    <div className="report-page w-full min-h-screen flex flex-col items-center bg-white">
      <div
        className="w-full max-w-[1440px] grow flex flex-col"
        style={{
          paddingLeft: 'clamp(24px, 8vw, 120px)',
          paddingRight: 'clamp(24px, 8vw, 120px)',
          paddingTop: 'calc(var(--ru) * 6)',
          paddingBottom: 'calc(var(--ru) * 8)',
        }}
      >
        {/* ── Header ── */}
        <header className="w-full rule-b pb-3">
          <div className="flex items-baseline justify-between gap-6">
            <div className="serif ink text-[34px] leading-[1.1]">
              cyber<span className="text-slate-400">·</span>Fund
            </div>
            <nav className="flex items-center gap-8 text-[12px] tracking-[0.08em] uppercase text-slate-500">
              <a href="/" className="hover:text-black transition-colors">Brief</a>
              <a href="/?page=explorer" className="hover:text-black transition-colors">Explorer</a>
            </nav>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-2">
            Agent Ecosystem Report · February 10, 2026
          </div>
          <h1 className="serif ink text-[clamp(28px,4.6vw,56px)] leading-[1.1] max-w-[32ch]">
            Eight agents generate all the revenue. The other 880 are noise.
          </h1>
          <p className="mt-4 text-[16px] muted max-w-[64ch]">
            Cross-platform analysis of 8004scan (ERC-8004 leaderboard, 40 agents) and x402scan (Composer agents, 850+). Focused on who is actually making money via x402 micropayments.
          </p>
        </section>

        {/* ── Vital Signs ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
            Vital Signs
          </div>
          <div className="mt-3">
            {vitalSigns.map((vs, i) => (
              <VitalSign key={i} {...vs} />
            ))}
          </div>
        </section>

        {/* ── Tier 1 Table ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-3">
            Tier 1 — Proven Revenue
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--ink)]">
                  <th className="pb-2 pr-3 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">#</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Agent</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell">Model</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden lg:table-cell">Key Metric</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Revenue</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell">Token</th>
                  <th className="pb-2 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {tier1Agents.map((a) => (
                  <AgentRow key={a.rank} agent={a} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Tier 2 Table ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-3">
            Tier 2 — Real Utility, Needs More Traction
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--ink)]">
                  <th className="pb-2 pr-3 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">#</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Agent</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell">Model</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden lg:table-cell">Key Metric</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Revenue</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell">Token</th>
                  <th className="pb-2 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {tier2Agents.map((a) => (
                  <AgentRow key={a.rank} agent={a} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Two-Column: Observations + Price Tiers ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-[calc(var(--ru)*6)]">
          {/* Key Observations */}
          <section>
            <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
              Key Observations
            </div>
            <div className="mt-3 space-y-5">
              {observations.map((obs, i) => (
                <div
                  key={i}
                  className="flex gap-4 cursor-pointer group"
                  onClick={() => setExpandedObs(expandedObs === i ? null : i)}
                >
                  <span className="serif text-[20px] ink leading-tight shrink-0 opacity-40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="muted leading-relaxed">
                      <strong className="ink font-medium">{obs.title}</strong>
                      {expandedObs === i ? (
                        <span> {obs.body}</span>
                      ) : (
                        <span className="text-slate-300"> ...</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Price Discovery */}
          <section>
            <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500">
              x402 Price Discovery
            </div>
            <div className="mt-3 p-6 bg-[#F8F9F9] border border-[var(--rule)]">
              <span className="serif ink text-[22px] leading-[1.2] block mb-4">
                The market is pricing tools by perceived value.
              </span>
              <div className="space-y-3">
                {priceTiers.map((pt, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[14px] ink font-medium shrink-0 w-[80px]">{pt.tier}</span>
                    <span className="text-[13px] muted flex-1">{pt.agent}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">{pt.type}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-5">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--dot-blue)]" />
                <span className="text-[12px] tracking-[0.05em] uppercase text-slate-400">
                  Premium analytics command 10x basic data
                </span>
              </div>
            </div>

            {/* Market Structure */}
            <div className="mt-6 p-6 bg-[#F8F9F9] border border-[var(--rule)]">
              <span className="serif ink text-[22px] leading-[1.2] block mb-3">
                Bottom Line
              </span>
              <div className="space-y-3 text-[14px] muted leading-relaxed">
                <p>
                  <strong className="ink font-medium">The signal:</strong> x402 micropayments + autonomous DeFi execution is the working model. ZyfAI and Otto AI have hard revenue metrics. Invariant has the cleanest business model.
                </p>
                <p>
                  <strong className="ink font-medium">The noise:</strong> 80%+ of agents are dead. Leaderboard ranking is gameable. Token-first projects are mostly DOA.
                </p>
                <p>
                  <strong className="ink font-medium">ERC-8004 is infrastructure, not alpha.</strong> The real opportunity is in agents that use the standard to build defensible businesses — not in "ecosystem tokens."
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Ecosystem Breakdown ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-3">
            8004scan Ecosystem Breakdown
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Real Business Models', value: '~7', pct: '18%', color: 'bg-emerald-500' },
              { label: 'Plausible but Unproven', value: '~8', pct: '20%', color: 'bg-amber-400' },
              { label: 'Memecoins / Speculation', value: '~10', pct: '25%', color: 'bg-red-400' },
              { label: 'Filler / Spam / No Data', value: '~15', pct: '37%', color: 'bg-slate-300' },
            ].map((seg, i) => (
              <div key={i} className="p-4 border border-[var(--rule)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${seg.color}`} />
                  <span className="serif ink text-[24px]">{seg.value}</span>
                </div>
                <div className="text-[12px] muted">{seg.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{seg.pct} of top 40</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Multi-Timeframe Patterns ── */}
        <section className="mt-[calc(var(--ru)*6)]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-3">
            Growth Trajectories (x402scan Multi-Timeframe)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--ink)]">
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Pattern</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Agent</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">7d Tools</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">30d Tools</th>
                  <th className="pb-2 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Signal</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {[
                  { pattern: 'Accelerating', agent: 'SniperX Agent', d7: '188', d30: '2,450', signal: '13x growth — PMF', color: 'text-emerald-600' },
                  { pattern: 'Accelerating', agent: 'SniperX-TrackAlpha', d7: '0', d30: '243', signal: 'Sub-agent ramping', color: 'text-emerald-600' },
                  { pattern: 'Explosive', agent: 'BotPay', d7: '14', d30: '121', signal: '$1/call · 15 days old', color: 'text-amber-500' },
                  { pattern: 'Flat', agent: '[t54] x402-secure', d7: '524', d30: '526', signal: '7d ≈ 30d — stagnant or API-first', color: 'text-slate-400' },
                  { pattern: 'Flat', agent: 'Silverback', d7: '26', d30: '80', signal: 'Consistent B2B integration', color: 'text-slate-400' },
                  { pattern: 'Collapsed', agent: 'Token Analyst (Heurist)', d7: '0', d30: '7', signal: 'Was 6,531 all-time → dead', color: 'text-red-500' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--rule)]">
                    <td className={`py-2.5 pr-4 font-medium ${row.color}`}>{row.pattern}</td>
                    <td className="py-2.5 pr-4 ink">{row.agent}</td>
                    <td className="py-2.5 pr-4 font-mono text-slate-500">{row.d7}</td>
                    <td className="py-2.5 pr-4 font-mono ink">{row.d30}</td>
                    <td className="py-2.5 muted">{row.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto pt-12">
          <div className="rule-b pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <span className="serif ink text-[18px]">Research complete.</span>
                <span className="muted text-[14px]">Focus on the 8 that matter.</span>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-slate-400">
                <span>8004scan.io</span>
                <span>x402scan.com</span>
                <span>Feb 10, 2026</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center text-[12px] text-slate-400">
            <span>cyber·Fund Research</span>
            <span>Sources: 8004scan.io, x402scan.com, Perplexity, Exa, Virtuals Protocol, CoinGecko</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
