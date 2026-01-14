import { useState, useEffect } from 'react'
import {
  Filter,
  ChevronDown,
  Clock,
  Briefcase,
  Users,
  BarChart,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { ItemCard } from '../components/ItemCard'
import type {
  ExplorerDashboard,
  DealSummary,
  EntitySummary,
  ExplorerItem,
  FilterType,
  MetricsByCompany
} from '../types'

// Section header component
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
  )
}

interface ExplorerPageProps {
  onNavigate: (page: string) => void
}

export function ExplorerPage({ onNavigate }: ExplorerPageProps) {
  const [data, setData] = useState<ExplorerDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null)
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(new Set())

  // Fetch explorer data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch('/api/explorer')
        if (!response.ok) {
          throw new Error('Failed to fetch explorer data')
        }
        const result = await response.json()
        if ('error' in result) {
          throw new Error(result.message || result.error)
        }
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter helpers
  const filterItems = (items: ExplorerItem[]): ExplorerItem[] => {
    if (filter === 'all') return items
    return items.filter(i => i.type === filter)
  }

  const getFilteredDeals = (): DealSummary[] => {
    if (!data) return []
    if (filter === 'all') return data.deals
    return data.deals.filter(deal => {
      const allItems = [...deal.items.metrics, ...deal.items.mentions, ...deal.items.decisions]
      return filterItems(allItems).length > 0
    })
  }

  const getFilteredEntities = (): EntitySummary[] => {
    if (!data) return []
    if (filter === 'all') return data.entities
    return data.entities.filter(entity => {
      const allItems = [
        ...entity.items.promisesIMade,
        ...entity.items.promisesToMe,
        ...entity.items.actionItems,
        ...entity.items.decisions,
        ...entity.items.metrics
      ]
      return filterItems(allItems).length > 0
    })
  }

  const getMyCommitments = (): ExplorerItem[] => {
    if (!data) return []
    return filterItems(data.myCommitments)
  }

  const getMetricsByCompany = (): MetricsByCompany[] => {
    if (!data) return []
    if (filter !== 'all' && filter !== 'metric') return []
    return data.metricsByCompany
  }

  const toggleCompanyCollapse = (company: string) => {
    const next = new Set(collapsedCompanies)
    if (next.has(company)) next.delete(company)
    else next.add(company)
    setCollapsedCompanies(next)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading explorer...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 font-medium mb-2">Failed to load explorer</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const filteredDeals = getFilteredDeals()
  const filteredEntities = getFilteredEntities()
  const myCommitments = getMyCommitments()
  const metricsByCompany = getMetricsByCompany()

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
                <span className="text-sm">Last {data?.timeRange.days || 14} days</span>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:shadow text-sm font-medium text-gray-700 transition-all">
                <Filter className="w-4 h-4 text-gray-400" />
                <span>
                  {filter === 'all' ? 'All Content' :
                   filter === 'action_item' ? 'Action Items' :
                   `${filter.charAt(0).toUpperCase() + filter.slice(1)}s Only`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 p-1 hidden group-hover:block z-50">
                {(['all', 'promise', 'action_item', 'decision', 'metric'] as FilterType[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === opt ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {opt === 'all' ? 'All Items' :
                     opt === 'action_item' ? 'Action Items' :
                     `${opt.charAt(0).toUpperCase() + opt.slice(1)}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 1. ACTIVE DEALS PANEL */}
        <section>
          <SectionHeader title="Active Deals" count={filteredDeals.length} icon={Briefcase} />
          {filteredDeals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
              No active deals in the last {data?.timeRange.days || 14} days
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map(deal => {
                const isExpanded = expandedDeal === deal.slug
                const metrics = filterItems(deal.items.metrics)
                const mentions = filterItems(deal.items.mentions)
                const decisions = filterItems(deal.items.decisions)

                return (
                  <div key={deal.slug} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-gray-300 hover:shadow-md">
                    <div
                      onClick={() => setExpandedDeal(isExpanded ? null : deal.slug)}
                      className="p-5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold font-serif text-gray-900">{deal.name}</h3>
                          {deal.hasFolder && (
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Has Folder</span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-400">{deal.lastActivity}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                        <span>{deal.items.metrics.length} Metrics</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{deal.items.mentions.length} Mentions</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{deal.items.decisions.length} Decisions</span>
                      </div>

                      {deal.names.length > 1 && (
                        <div className="text-xs text-gray-400 mb-2">
                          Also known as: {deal.names.slice(1).join(', ')}
                        </div>
                      )}

                      {deal.items.metrics[0] && (
                        <div className="text-sm text-gray-600 font-medium truncate">
                          <span className="text-gray-400 mr-2">Latest:</span>
                          {deal.items.metrics[0].content}
                        </div>
                      )}
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
                            Introduced by: <span className="font-medium text-gray-600">{deal.introducedBy.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 2. RECENT PEOPLE PANEL */}
        <section>
          <SectionHeader title="Recent People" count={filteredEntities.length} icon={Users} />
          {filteredEntities.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
              No recent interactions found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntities.map(person => {
                const isExpanded = expandedPerson === person.slug
                const promisesIMade = filterItems(person.items.promisesIMade)
                const promisesToMe = filterItems(person.items.promisesToMe)
                const actionItems = filterItems(person.items.actionItems)
                const decisions = filterItems(person.items.decisions)
                const metrics = filterItems(person.items.metrics)

                const totalItems = promisesIMade.length + promisesToMe.length + actionItems.length + decisions.length + metrics.length

                return (
                  <div key={person.slug} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-gray-300 hover:shadow-md">
                    <div
                      onClick={() => setExpandedPerson(isExpanded ? null : person.slug)}
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
                        {person.email && person.telegram && <span className="text-gray-300">&bull;</span>}
                        {person.telegram && <span className="font-medium text-blue-500">@{person.telegram}</span>}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{totalItems} items</span>
                          <span className="text-xs text-gray-400">Last: {person.lastActivity}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-6">
                        {promisesIMade.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-3">I Promised Them ({promisesIMade.length})</h4>
                            <div className="space-y-2">
                              {promisesIMade.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                            </div>
                          </div>
                        )}

                        {promisesToMe.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-3">They Promised Me ({promisesToMe.length})</h4>
                            <div className="space-y-2">
                              {promisesToMe.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                            </div>
                          </div>
                        )}

                        {actionItems.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-3">Action Items ({actionItems.length})</h4>
                            <div className="space-y-2">
                              {actionItems.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                            </div>
                          </div>
                        )}

                        {decisions.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3">Decisions ({decisions.length})</h4>
                            <div className="space-y-2">
                              {decisions.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                            </div>
                          </div>
                        )}

                        {metrics.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-3">Metrics ({metrics.length})</h4>
                            <div className="space-y-2">
                              {metrics.map(item => <ItemCard key={item.id} item={item} hideOwner />)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 3. MY COMMITMENTS PANEL */}
        {(filter === 'all' || filter === 'promise' || filter === 'action_item') && (
          <section>
            <SectionHeader title="My Commitments" count={myCommitments.length} icon={CheckCircle} />
            {myCommitments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                No pending commitments found
              </div>
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
        {metricsByCompany.length > 0 && (
          <section>
            <SectionHeader
              title="Metrics Overview"
              count={metricsByCompany.reduce((sum, c) => sum + c.metrics.length, 0)}
              icon={BarChart}
            />
            <div className="space-y-4">
              {metricsByCompany.map(group => {
                const isCollapsed = collapsedCompanies.has(group.company)

                return (
                  <div key={group.company} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCompanyCollapse(group.company)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{group.company}</span>
                        <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-1.5 rounded">
                          {group.metrics.length}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>

                    {!isCollapsed && (
                      <div className="p-4 space-y-2 bg-white">
                        {group.metrics.map(item => (
                          <ItemCard key={item.id} item={item} compact />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
