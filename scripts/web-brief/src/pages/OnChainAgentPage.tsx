import { useState } from 'react';

// ── Data ──────────────────────────────────────────────────

const keyNumbers = [
  { label: 'x402 Lifetime Volume', value: '$43.55M', delta: '161.25M transactions', color: 'var(--dot-green)' },
  { label: 'ERC-8004 Registered Agents', value: '20,892+', delta: '2 weeks since mainnet', color: 'var(--dot-green)' },
  { label: 'x402 Daily Volume (24h)', value: '$34.23K', delta: '67+ servers, 265 resources', color: 'var(--dot-blue)' },
  { label: 'ERC-8004 Active Users', value: '22,279+', delta: '15,547 feedback submitted', color: 'var(--dot-blue)' },
  { label: 'x402 Annualized Revenue', value: '$12.4M', delta: 'top 10 servers + unlisted', color: 'var(--dot-green)' },
  { label: 'ERC-8004 Chain Deployments', value: '21', delta: '5 active, 16 contracts deployed', color: 'var(--dot-gold)' },
];

type Verdict = 'TRUST INFRA' | 'API GATEWAY' | 'DEFI INTEL' | 'M2M COMMERCE' | 'DEFI AGENT' | 'IOT FRONTIER' | 'SOCIAL DATA' | 'AI INFERENCE' | 'GAMING' | 'PERP TRADING';

interface Server {
  rank: number;
  name: string;
  domain: string;
  chain: 'Base' | 'Solana';
  volume24h: string;
  txns24h: string;
  buyers: string;
  resources: number;
  verdict: Verdict;
  facilitator: string;
  insight: string;
  url: string;
}

const topServers: Server[] = [
  { rank: 1, name: 'x402-secure (t54)', domain: 'x402-secure-api.t54.ai', chain: 'Base', volume24h: '$5.63K', txns24h: '67.28K', buyers: '2,510', resources: 10, verdict: 'TRUST INFRA', facilitator: 'Heurist, PayAI', insight: 'Trust scoring for agents. #1 by txn volume. 71% direct API traffic. Becoming the "credit bureau" of the agent economy.', url: 'https://www.x402scan.com/server/655c6f59-88df-4bf2-99c5-42e392322c84' },
  { rank: 2, name: 'Dexter', domain: 'x402.dexter.cash', chain: 'Solana', volume24h: '$2.03K', txns24h: '39.81K', buyers: '929', resources: 22, verdict: 'DEFI INTEL', facilitator: 'Dexter', insight: 'Most diversified server: PokéDexter battles, Jupiter swaps, deep research, code interpreter, meme gen, Sora video, Twitter analysis.', url: 'https://www.x402scan.com/server/76434304-54f7-44f6-9d8d-91a5e189edcb' },
  { rank: 3, name: 'enrichx402', domain: 'enrichx402.com', chain: 'Base', volume24h: '$703', txns24h: '23.29K', buyers: '23', resources: 30, verdict: 'API GATEWAY', facilitator: 'Coinbase', insight: 'Wraps 8+ premium APIs (Apollo, Exa, Firecrawl, Google Maps, Grok, Serper, Whitepages, Reddit) behind one x402 paywall. 23 buyers, 23K calls/day — pure B2B.', url: 'https://www.x402scan.com/server/bc9dc00a-c7d5-458e-8d67-e2d2ddb60a2a' },
  { rank: 4, name: 'Virtuals ACP', domain: 'acp-x402.virtuals.io', chain: 'Base', volume24h: '$12.19K', txns24h: '18.62K', buyers: '497', resources: 2, verdict: 'M2M COMMERCE', facilitator: 'Coinbase, Virtuals', insight: 'HIGHEST dollar volume. 2 endpoints at $0.001. ALL agent-to-agent commerce. Otto AI handles 41.5% of ACP jobs. The M2M thesis in action.', url: 'https://www.x402scan.com/server/bc1f8da1-bc0c-4d2c-8879-92d60aa90f02' },
  { rank: 5, name: 'blockrun.ai', domain: 'blockrun.ai', chain: 'Base', volume24h: '$1.03K', txns24h: '15.66K', buyers: '115', resources: 3, verdict: 'AI INFERENCE', facilitator: 'Coinbase', insight: 'AI image gen, Grok search, chat completions. 100% programmatic traffic. "Pay for intelligence with USDC. No API keys."', url: 'https://www.x402scan.com/server/b85dcf0f-d4a9-47ce-9d0b-6ec70e2844e0' },
  { rank: 6, name: 'SniperX', domain: 'x402.sniperx.fun', chain: 'Solana', volume24h: '$103', txns24h: '5.16K', buyers: '12', resources: 19, verdict: 'DEFI INTEL', facilitator: 'PayAI', insight: '19 Solana alpha endpoints: whale/KOL/smart money tracking, token analytics. Top agent by tool call volume.', url: 'https://www.x402scan.com/server/010f69d6-ad17-4cb4-8ebf-bfba7a23f076' },
  { rank: 7, name: 'Pinion', domain: 'pinionos.com', chain: 'Base', volume24h: '$11.54', txns24h: '1.15K', buyers: '683', resources: 5, verdict: 'DEFI INTEL', facilitator: 'PayAI', insight: 'Blockchain tools: balances, tx decoding, wallet gen, ETH prices, AI chat at $0.01/msg.', url: 'https://www.x402scan.com/server/49a688db-0234-4609-948c-c3eee1719e5d' },
  { rank: 8, name: 'FortClaw', domain: 'mcp.fortclaw.com', chain: 'Base', volume24h: '$1.12', txns24h: '1.12K', buyers: '5', resources: 0, verdict: 'GAMING', facilitator: 'Coinbase', insight: 'Territory game for AI agents. Novel but minimal traction.', url: 'https://www.x402scan.com/server/7d0d89f2-0ca9-41cf-820c-b8d23ffc0f37' },
  { rank: 9, name: '100xSOON', domain: 'api.100xsoon.com', chain: 'Base', volume24h: '$3.12K', txns24h: '656', buyers: '12', resources: 2, verdict: 'PERP TRADING', facilitator: 'Coinbase', insight: 'Perpetual futures via x402. $260 avg position. Real DeFi use case.', url: 'https://www.x402scan.com/server/75f6d295-5335-4e4a-9c9e-c70a2dc4394f' },
  { rank: 10, name: 'Neynar', domain: 'api.neynar.com', chain: 'Base', volume24h: '$0.63', txns24h: '625', buyers: '25', resources: 4, verdict: 'SOCIAL DATA', facilitator: 'Coinbase', insight: 'Farcaster social data API. $0.001/call. Closest to a "real" (non-crypto) API service.', url: 'https://www.x402scan.com/server/fe272202-7c8a-4eb3-9859-fce7bbd6d6a2' },
];

interface Agent8004 {
  rank: number;
  name: string;
  chain: string;
  score: number;
  feedback: number;
  mcpHealthy: boolean;
  a2aHealthy: boolean;
  description: string;
  verdict: string;
  url: string;
}

const topAgents8004: Agent8004[] = [
  { rank: 1, name: 'James', chain: 'Base', score: 88.57, feedback: 29, mcpHealthy: true, a2aHealthy: false, description: 'Robotics/automation specialist from Meerkat Town. Knowledge chatbot.', verdict: 'No business model', url: 'https://8004scan.io/agents/base/1434' },
  { rank: 2, name: 'Captain Dackie', chain: 'Base', score: 88.0, feedback: 1511, mcpHealthy: false, a2aHealthy: true, description: 'DeFAI + x402 agent from Capminal. Virtuals Protocol token holder.', verdict: 'Token-driven engagement', url: 'https://8004scan.io/agents/base/1380' },
  { rank: 4, name: 'Minara AI', chain: 'Ethereum', score: 87.64, feedback: 134, mcpHealthy: false, a2aHealthy: true, description: 'Crypto assistant with x402 subdomain (x402.minara.ai). Real product.', verdict: 'Legitimate product', url: 'https://8004scan.io/agents/ethereum/6888' },
  { rank: 7, name: 'Clawdia', chain: 'Base', score: 85.57, feedback: 599, mcpHealthy: true, a2aHealthy: true, description: 'ClawPlaza orchestrator. Agent collaboration, task routing. No token.', verdict: 'Novel marketplace', url: 'https://8004scan.io/agents/base/2290' },
  { rank: 8, name: 'Gekko Rebalancer', chain: 'Base', score: 85.25, feedback: 245, mcpHealthy: false, a2aHealthy: true, description: 'DeFi portfolio rebalancing. Detects drift, executes rebalancing.', verdict: 'Real utility, $GEKKO -98%', url: 'https://8004scan.io/agents/base/1378' },
  { rank: 13, name: 'EZCTO Deployer', chain: 'BSC', score: 84.93, feedback: 22, mcpHealthy: true, a2aHealthy: true, description: 'Website/asset automation. First notable BSC agent. Both protocols healthy.', verdict: 'Practical application', url: 'https://8004scan.io/agents/bsc/137' },
  { rank: 18, name: 'CeloFX', chain: 'Celo', score: 84.54, feedback: 24, mcpHealthy: false, a2aHealthy: true, description: 'FX arbitrage on Celo Mento stablecoins. Claude AI-powered. TEE verified.', verdict: 'Real FX arbitrage', url: 'https://8004scan.io/agents/celo/10' },
  { rank: 19, name: 'GanjaMon', chain: 'Monad', score: 84.51, feedback: 76, mcpHealthy: true, a2aHealthy: true, description: 'AI-autonomous cannabis grow tent + trading signals. Physical world IoT.', verdict: 'Most unique agent', url: 'https://8004scan.io/agents/monad/4' },
];

const observations = [
  { title: 'The real economy is server-to-server API calls.', body: '138,630 transactions/day at the server level. $34K daily volume. The vast majority of x402 activity is programmatic — agents calling APIs autonomously, not users clicking buttons. The investment thesis is about backends, not chatbots.' },
  { title: 'Virtuals ACP is the thesis in action.', body: 'The simplest API (2 endpoints, $0.001 each) generates the highest dollar volume ($12.19K/day). All activity is agent-to-agent commerce — AI agents hiring other AI agents, paying via x402. Otto AI handles 41.5% of all ACP jobs.' },
  { title: 'API aggregation is the killer app.', body: 'enrichx402.com wraps 8+ premium APIs (Apollo, Exa, Firecrawl, Google Maps, Grok, Serper, Whitepages, Reddit) behind a single x402 payment interface. No auth, no subscriptions, just USDC per call. 23 buyers make 23,290 calls/day.' },
  { title: 'Token-first projects are mostly failing.', body: 'The best utility agents (t54, Invariant, ClawPlaza, Minara AI) have no token. Token-dependent projects ($GEKKO -98%, Captain Dackie $CAP $214K mcap) are struggling. "Would it work better without a token?" is the key question.' },
  { title: 'ERC-8004 + x402 = complementary stack.', body: 'All top 8004scan agents have X402 badges. Minara AI has x402.minara.ai subdomain. GanjaMon has full x402 micropayment support. But nobody has built the middleware linking reputation scores to payment authorization — biggest unbuilt opportunity.' },
  { title: 'Stripe validated the entire thesis.', body: 'Feb 11: Stripe Machine Payments with x402, CoinGecko x402 API, Coinbase Agentic Wallets — all in one day. Google UCP launched at NRF backed by Visa/Mastercard/PayPal. The infrastructure war is over; now it\'s about demand.' },
];

const priceTiers = [
  { tier: '$1.00+', agent: 'BotPay (NFT mint)', type: 'Premium transactions' },
  { tier: '$0.50', agent: 'Invariant (security audit)', type: 'Professional B2B' },
  { tier: '$0.10', agent: 'SniperX (advanced analytics)', type: 'High-value data' },
  { tier: '$0.01\u2013$0.05', agent: 't54, basic data APIs', type: 'Commodity queries' },
  { tier: '$0.001', agent: 'Virtuals ACP, Neynar', type: 'Micro-micro payments' },
];

const ecosystemProjects = [
  { category: 'Facilitators', count: 7, examples: 'CDP, PayAI, Corbits, Meridian, Mogami, x402.org, x402.rs' },
  { category: 'Services', count: 14, examples: 'Firecrawl, Neynar, Pinata, Questflow, Gloria AI, Heurist' },
  { category: 'Infrastructure', count: 12, examples: 'Daydreams Router, Heurist Mesh, MCPay, Proxy402, thirdweb' },
  { category: 'Client SDKs', count: 4, examples: 'Axios/Fetch, Mogami Java, thirdweb, Tweazy' },
  { category: 'Learning', count: 3, examples: 'x402 Example Gallery, awesome-x402, Mogami examples' },
];

const chainDeployments = [
  { chain: 'Base', status: 'active', agents: '7 in top 20' },
  { chain: 'Ethereum', status: 'active', agents: '8 in top 20' },
  { chain: 'BNB Smart Chain', status: 'active', agents: 'EZCTO #13' },
  { chain: 'Monad', status: 'active', agents: 'GanjaMon #19' },
  { chain: 'Celo', status: 'active', agents: 'CeloFX #18' },
  { chain: 'Polygon', status: 'soon', agents: '' },
  { chain: 'Arbitrum', status: 'soon', agents: '' },
  { chain: 'Optimism', status: 'soon', agents: '' },
  { chain: 'Scroll', status: 'soon', agents: '' },
  { chain: 'MegaETH', status: 'soon', agents: '' },
  { chain: 'Avalanche', status: 'soon', agents: '' },
  { chain: 'Linea', status: 'soon', agents: '' },
  { chain: 'Gnosis', status: 'soon', agents: '' },
  { chain: 'Taiko', status: 'soon', agents: '' },
  { chain: 'Plasma', status: 'soon', agents: '' },
  { chain: 'Abstract', status: 'soon', agents: '' },
];

// ── Helpers ───────────────────────────────────────────────

const verdictColor = (v: string) => {
  if (['TRUST INFRA', 'API GATEWAY', 'M2M COMMERCE'].includes(v)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['DEFI INTEL', 'AI INFERENCE', 'SOCIAL DATA'].includes(v)) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (['PERP TRADING', 'DEFI AGENT'].includes(v)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (['GAMING', 'IOT FRONTIER'].includes(v)) return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

// ── Components ────────────────────────────────────────────

const SectionLabel = ({ children }: { children: string }) => (
  <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-3">
    {children}
  </div>
);

const Rule = () => <div className="border-b border-rule" />;

const VitalSign = ({ label, value, delta, color }: { label: string; value: string; delta: string; color: string }) => (
  <div className="border-b border-rule">
    <div className="flex items-baseline justify-between py-4">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-ink text-[28px] leading-[1.15]">{label}</span>
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color, transform: 'translateY(0.06em)' }} />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-ink text-[28px]">{value}</span>
        <span className="text-muted text-[14px] hidden sm:inline">{delta}</span>
      </div>
    </div>
  </div>
);

const ServerRow = ({ server }: { server: Server }) => (
  <tr className="border-b border-rule hover:bg-surface transition-colors">
    <td className="py-3 pr-3 text-[13px] text-slate-400 font-mono">{server.rank}</td>
    <td className="py-3 pr-4">
      <a href={server.url} target="_blank" rel="noopener noreferrer" className="text-ink font-medium text-[15px] hover:underline no-underline">{server.name}</a>
      <div className="text-[11px] text-slate-400">{server.domain}</div>
    </td>
    <td className="py-3 pr-4 text-[13px] text-muted hidden md:table-cell">{server.chain}</td>
    <td className="py-3 pr-4 text-[13px] text-ink font-mono whitespace-nowrap">{server.volume24h}</td>
    <td className="py-3 pr-4 text-[13px] text-muted font-mono hidden lg:table-cell">{server.txns24h}</td>
    <td className="py-3 pr-4 text-[13px] text-muted hidden md:table-cell">{server.buyers}</td>
    <td className="py-3 pr-4 text-[13px] text-muted hidden lg:table-cell">{server.resources}</td>
    <td className="py-3">
      <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${verdictColor(server.verdict)}`}>
        {server.verdict}
      </span>
    </td>
  </tr>
);

const AgentRow = ({ agent }: { agent: Agent8004 }) => (
  <tr className="border-b border-rule hover:bg-surface transition-colors">
    <td className="py-3 pr-3 text-[13px] text-slate-400 font-mono">#{agent.rank}</td>
    <td className="py-3 pr-4">
      <a href={agent.url} target="_blank" rel="noopener noreferrer" className="text-ink font-medium text-[15px] hover:underline no-underline">{agent.name}</a>
      <div className="text-[11px] text-slate-400">{agent.chain}</div>
    </td>
    <td className="py-3 pr-4 text-[14px] text-ink font-mono hidden sm:table-cell">{agent.score.toFixed(1)}</td>
    <td className="py-3 pr-4 text-[13px] text-muted font-mono hidden md:table-cell">{agent.feedback.toLocaleString()}</td>
    <td className="py-3 pr-4 hidden md:table-cell">
      <div className="flex gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full mt-1 ${agent.mcpHealthy ? 'bg-dot-green' : 'bg-dot-red'}`} title={agent.mcpHealthy ? 'MCP Healthy' : 'MCP Unhealthy'} />
        <span className={`inline-block w-2 h-2 rounded-full mt-1 ${agent.a2aHealthy ? 'bg-dot-green' : 'bg-dot-red'}`} title={agent.a2aHealthy ? 'A2A Healthy' : 'A2A Unhealthy'} />
      </div>
    </td>
    <td className="py-3 pr-4 text-[13px] text-muted hidden lg:table-cell max-w-[260px] truncate">{agent.description}</td>
    <td className="py-3 text-[12px] text-muted italic">{agent.verdict}</td>
  </tr>
);

// ── Page ──────────────────────────────────────────────────

export function OnChainAgentPage() {
  const [expandedObs, setExpandedObs] = useState<number | null>(null);
  const [expandedServer, setExpandedServer] = useState<number | null>(null);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white">
      <div
        className="w-full max-w-[1440px] grow flex flex-col"
        style={{
          paddingLeft: 'clamp(24px, 8vw, 120px)',
          paddingRight: 'clamp(24px, 8vw, 120px)',
          paddingTop: '72px',
          paddingBottom: '96px',
        }}
      >
        {/* ── Header ── */}
        <header className="w-full border-b border-ink pb-3">
          <div className="flex items-baseline justify-between gap-6">
            <a href="/" className="font-serif text-ink text-[34px] leading-[1.1] no-underline hover:opacity-80 transition-opacity">
              cyber<span className="text-slate-400">&middot;</span>Fund
            </a>
            <nav className="flex items-center gap-8 text-[12px] tracking-[0.08em] uppercase text-slate-500">
              <span>Research</span>
              <span className="text-ink font-medium">Feb 12, 2026</span>
            </nav>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="mt-[72px]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-slate-500 mb-2">
            On-Chain Agent Economy &middot; x402 + ERC-8004
          </div>
          <h1 className="font-serif text-ink text-[clamp(28px,4.6vw,56px)] leading-[1.1] max-w-[36ch]">
            Agents are paying agents &mdash; $12M/year, but 85% earn nothing
          </h1>
          <p className="mt-4 text-[16px] text-muted max-w-[68ch] leading-relaxed">
            x402 micropayments + ERC-8004 agent identity are creating the first machine-to-machine economy. 67+ servers, 20,892+ registered agents, 21 chains. This report maps the business models that work, the ones that don't, and where the value accrues.
          </p>
        </section>

        {/* ── Key Numbers ── */}
        <section className="mt-[72px]">
          <SectionLabel>Key Numbers</SectionLabel>
          {keyNumbers.map((vs, i) => (
            <VitalSign key={i} {...vs} />
          ))}
        </section>

        {/* ── Top Business Models ── */}
        <section className="mt-[72px]">
          <SectionLabel>Top Business Models & Use Cases</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { model: 'M2M Commerce', example: 'Virtuals ACP', revenue: '$12.19K/day', desc: 'Agent-to-agent job marketplace. 2 endpoints, $0.001 each. Otto AI handles 41.5% of all jobs. Purest M2M play.' },
              { model: 'Trust Infrastructure', example: 't54', revenue: '$5.63K/day', desc: 'Agent reputation scoring. "Credit bureau" of the agent economy — every other service needs trust data.' },
              { model: 'Perp Trading', example: '100xSOON', revenue: '$3.12K/day', desc: 'Perpetual futures execution via x402. $260 avg position size. Real DeFi use case.' },
              { model: 'DeFi Intelligence', example: 'SniperX, Dexter', revenue: '$2.1K/day', desc: 'On-chain analytics, whale tracking, token research. Agents pay per query for alpha signals.' },
              { model: 'AI Inference', example: 'blockrun.ai', revenue: '$1.03K/day', desc: 'Pay-per-query AI models (image gen, search, chat). "Pay for intelligence with USDC. No API keys."' },
              { model: 'API Aggregation', example: 'enrichx402', revenue: '$703/day', desc: 'Wraps 8+ premium APIs (Apollo, Exa, Firecrawl, Google Maps) behind one x402 paywall. No auth, no subscriptions.' },
              { model: 'Facilitators', example: 'Coinbase CDP, PayAI', revenue: 'Fee on all tx', desc: 'Settlement infrastructure — take a cut of every x402 payment. 14+ facilitators, Coinbase ~34% share.' },
              { model: 'Physical World / IoT', example: 'GanjaMon', revenue: 'Early', desc: 'AI-autonomous sensor data + actuator control. Cannabis grow tent with x402 micropayments. First physical-world agent.' },
            ].map((bm, i) => (
              <div key={i} className="flex gap-4 py-5 border-b border-rule">
                <span className="font-serif text-[24px] text-ink leading-tight shrink-0 opacity-30 w-7 text-right">
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="text-ink font-medium text-[17px]">{bm.model}</span>
                    <span className="font-mono text-[13px] text-dot-green">{bm.revenue}</span>
                  </div>
                  <div className="text-[12px] text-slate-400 mb-1.5">{bm.example}</div>
                  <p className="text-[15px] text-muted leading-relaxed">{bm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── x402 Top Servers ── */}
        <section className="mt-[72px]">
          <SectionLabel>x402 Top Servers — Where Real Revenue Happens (24h, Feb 12)</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-ink">
                  {['#', 'Server', 'Chain', 'Volume', 'Txns', 'Buyers', 'Resources', 'Type'].map((h) => (
                    <th key={h} className={`pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium ${['Chain', 'Buyers'].includes(h) ? 'hidden md:table-cell' : ''} ${['Txns', 'Resources'].includes(h) ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topServers.map((s) => (
                  <ServerRow key={s.rank} server={s} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Server Insights */}
          <div className="mt-6 space-y-3">
            {topServers.filter(s => s.insight).map((s) => (
              <div
                key={s.rank}
                className="flex gap-4 cursor-pointer group"
                onClick={() => setExpandedServer(expandedServer === s.rank ? null : s.rank)}
              >
                <span className="font-serif text-[18px] text-ink leading-tight shrink-0 opacity-30 w-6 text-right">
                  {s.rank}
                </span>
                <p className="text-muted text-[14px] leading-relaxed">
                  <strong className="text-ink font-medium">{s.name}</strong>
                  {expandedServer === s.rank ? (
                    <span> &mdash; {s.insight}</span>
                  ) : (
                    <span className="text-slate-300"> ...</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ERC-8004 Top Agents ── */}
        <section className="mt-[72px]">
          <SectionLabel>ERC-8004 Agent Deep Dives (8004scan.io, 20,892+ registered)</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="pb-2 pr-3 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Rank</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Agent</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden sm:table-cell">Score</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell">Feedback</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden md:table-cell" title="MCP / A2A">Health</th>
                  <th className="pb-2 pr-4 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium hidden lg:table-cell">Description</th>
                  <th className="pb-2 text-[10px] tracking-[0.1em] uppercase text-slate-400 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {topAgents8004.map((a) => (
                  <AgentRow key={a.rank} agent={a} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Two-Column: Observations + Price Discovery ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-[72px]">
          <section>
            <SectionLabel>Key Observations</SectionLabel>
            <div className="mt-3 space-y-5">
              {observations.map((obs, i) => (
                <div
                  key={i}
                  className="flex gap-4 cursor-pointer group"
                  onClick={() => setExpandedObs(expandedObs === i ? null : i)}
                >
                  <span className="font-serif text-[20px] text-ink leading-tight shrink-0 opacity-40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-muted leading-relaxed">
                      <strong className="text-ink font-medium">{obs.title}</strong>
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

          <section>
            <SectionLabel>x402 Price Discovery</SectionLabel>
            <div className="p-6 bg-surface border border-rule">
              <span className="font-serif text-ink text-[22px] leading-[1.2] block mb-4">
                89.2% of services priced $0.01&ndash;$0.10
              </span>
              <div className="space-y-3">
                {priceTiers.map((pt, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[14px] text-ink font-medium shrink-0 w-[90px]">{pt.tier}</span>
                    <span className="text-[13px] text-muted flex-1">{pt.agent}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">{pt.type}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-5">
                <span className="inline-block w-2 h-2 rounded-full bg-dot-blue" />
                <span className="text-[12px] tracking-[0.05em] uppercase text-slate-400">
                  Credit cards need $0.30 min &mdash; x402 settles for &lt;$0.01
                </span>
              </div>
            </div>

            <div className="mt-6">
              <SectionLabel>x402 Ecosystem (38+ projects)</SectionLabel>
              <div className="space-y-2">
                {ecosystemProjects.map((ep, i) => (
                  <div key={i} className="flex items-baseline gap-3 py-2 border-b border-rule">
                    <span className="font-mono text-[14px] text-ink font-medium w-[30px]">{ep.count}</span>
                    <span className="text-[13px] text-ink font-medium w-[100px]">{ep.category}</span>
                    <span className="text-[12px] text-muted flex-1">{ep.examples}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── ERC-8004 Network Deployments ── */}
        <section className="mt-[72px]">
          <SectionLabel>ERC-8004 Chain Deployments (Same contracts via CREATE2)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {chainDeployments.map((c, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded border text-[12px] font-medium ${
                  c.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {c.chain}
                {c.agents && <span className="text-[10px] ml-1 opacity-60">{c.agents}</span>}
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted mt-3">5 chains active, 16 with deployed registry contracts (Coming Soon)</p>
        </section>

        {/* ── Revenue Reality ── */}
        <section className="mt-[72px]">
          <SectionLabel>Daily Revenue by Server (Feb 12, 2026)</SectionLabel>
          <div className="space-y-1">
            {[...topServers].sort((a, b) => {
              const parseVol = (v: string) => parseFloat(v.replace('$', '').replace('K', '000').replace(',', ''));
              return parseVol(b.volume24h) - parseVol(a.volume24h);
            }).map((s) => {
              const maxVol = 12190;
              const vol = parseFloat(s.volume24h.replace('$', '').replace('K', '000').replace(',', ''));
              const pct = Math.max((vol / maxVol) * 100, 1);
              return (
                <div key={s.rank} className="flex items-center gap-3 py-1.5">
                  <span className="text-[13px] text-ink font-medium w-[120px] shrink-0 truncate">{s.name}</span>
                  <div className="flex-1 h-5 bg-slate-50 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm flex items-center pl-2"
                      style={{ width: `${pct}%`, minWidth: '40px', backgroundColor: 'rgba(35, 53, 52, 0.1)' }}
                    >
                      <span className="text-[11px] font-mono text-ink">{s.volume24h}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${verdictColor(s.verdict)} hidden sm:inline`}>
                    {s.verdict}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-surface border border-rule">
            <span className="text-[14px] text-muted">
              <strong className="text-ink font-medium">Total visible:</strong> ~$24.8K/day from top 10 servers + ~$4.25K unlisted = <strong className="text-ink">~$34K/day ($12.4M annualized)</strong>
            </span>
          </div>
        </section>

        {/* ── Investment Analysis ── */}
        <section className="mt-[72px]">
          <SectionLabel>Investment Analysis</SectionLabel>
          <div className="p-8 bg-surface border border-rule">
            <span className="font-serif text-ink text-[22px] leading-[1.2] block mb-4">
              Neither protocol is directly investable. Value accrues to the ecosystem.
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <strong className="text-ink font-medium text-[14px] block mb-3">Where value accrues</strong>
                <div className="space-y-2 text-[13px] text-muted">
                  <div className="flex justify-between"><span>Primary facilitator (Coinbase)</span><span className="font-mono text-ink">COIN</span></div>
                  <div className="flex justify-between"><span>L2 chain (Base)</span><span className="font-mono text-ink">COIN / $BASE?</span></div>
                  <div className="flex justify-between"><span>Stablecoin (Circle USDC)</span><span className="font-mono text-ink">IPO planned</span></div>
                  <div className="flex justify-between"><span>Agent commerce (Virtuals)</span><span className="font-mono text-ink">$VIRTUAL</span></div>
                  <div className="flex justify-between"><span>Agent identity (AltLayer)</span><span className="font-mono text-ink">$ALT</span></div>
                  <Rule />
                  <div className="flex justify-between"><span>Trust infra (t54)</span><span className="text-ink">Private</span></div>
                  <div className="flex justify-between"><span>API aggregation (enrichx402)</span><span className="text-ink">Private</span></div>
                  <div className="flex justify-between"><span>AI inference (Heurist, blockrun)</span><span className="text-ink">Private</span></div>
                  <div className="flex justify-between"><span>Facilitator (Dexter, PayAI)</span><span className="text-ink">Private</span></div>
                </div>
              </div>
              <div>
                <strong className="text-ink font-medium text-[14px] block mb-3">Investment framework</strong>
                <div className="space-y-3 text-[13px] text-muted leading-relaxed">
                  <p><strong className="text-ink">1.</strong> Revenue from usage, not tokens &mdash; t54, Invariant, enrichx402 charge per-query</p>
                  <p><strong className="text-ink">2.</strong> Infrastructure positioning &mdash; facilitators and trust layers capture % of all activity</p>
                  <p><strong className="text-ink">3.</strong> No token dependency &mdash; business works without speculation</p>
                  <p><strong className="text-ink">4.</strong> API-first design &mdash; programmatic server traffic dominates the economy</p>
                  <p><strong className="text-ink">5.</strong> Growing on-chain metrics &mdash; verifiable on x402scan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What to Watch ── */}
        <section className="mt-[72px]">
          <SectionLabel>What to Watch</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <strong className="text-ink font-medium text-[14px] block mb-3">Catalysts</strong>
              <div className="space-y-2 text-[13px] text-muted leading-relaxed">
                <p>Cloudflare x402 integration at CDN scale (~20% of internet)</p>
                <p>CoinGecko x402 traction &mdash; first major data provider test</p>
                <p>ERC-8004 + x402 middleware &mdash; reputation-gated payments</p>
                <p>$BASE token launch (69% Polymarket odds for 2026)</p>
                <p>GPT-5 / Claude next-gen &mdash; more capable autonomous agents</p>
              </div>
            </div>
            <div>
              <strong className="text-ink font-medium text-[14px] block mb-3">Risks</strong>
              <div className="space-y-2 text-[13px] text-muted leading-relaxed">
                <p>Agent capabilities plateau &mdash; x402/ERC-8004 ahead of their time</p>
                <p>Stripe ACP wins consumer payments, x402 relegated to niche M2M</p>
                <p>Regulatory uncertainty around autonomous agent payments</p>
                <p>Coinbase centralization (still ~34% of facilitator volume)</p>
                <p>Spam/gaming degrades ERC-8004 reputation signal quality</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto pt-[72px]">
          <div className="border-b border-ink pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <span className="font-serif text-ink text-[18px]">Research complete.</span>
                <span className="text-muted text-[14px]">The pipes work. Now it's about demand.</span>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-slate-400">
                <span>x402scan.com</span>
                <span>8004scan.io</span>
                <span>Feb 12, 2026</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center text-[12px] text-slate-400 flex-wrap gap-2">
            <span>cyber&middot;Fund Research</span>
            <a href="https://twitter.com/cyntro_py" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ink transition-colors no-underline">@cyntro_py</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
