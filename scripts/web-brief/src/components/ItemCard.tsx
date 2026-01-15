import { Phone, Mail, MessageSquare } from 'lucide-react'
import type { ExplorerItem, ItemType, TrustLevel, SourceType } from '../types'

// Type badge with distinct colors for each item type
function TypeBadge({ type }: { type: ItemType }) {
  const styles: Record<ItemType, string> = {
    action_item: 'bg-rose-50 text-rose-600 border-rose-100',
    promise: 'bg-blue-50 text-blue-600 border-blue-100',
    decision: 'bg-purple-50 text-purple-600 border-purple-100',
    metric: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    question: 'bg-amber-50 text-amber-600 border-amber-100',
    deal_mention: 'bg-gray-50 text-gray-600 border-gray-100'
  }

  const labels: Record<ItemType, string> = {
    action_item: 'ACTION',
    promise: 'PROMISE',
    decision: 'DECISION',
    metric: 'METRIC',
    question: 'QUESTION',
    deal_mention: 'MENTION'
  }

  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

// Trust level indicator
function TrustBadge({ level }: { level?: TrustLevel }) {
  if (!level) return null
  const colors: Record<TrustLevel, string> = {
    high: 'text-emerald-500',
    medium: 'text-gray-400',
    low: 'text-amber-500'
  }
  return (
    <span className={`text-[10px] font-mono font-medium ${colors[level]}`}>
      {`{${level}}`}
    </span>
  )
}

// Source icon selector
function getSourceIcon(type: SourceType) {
  switch (type) {
    case 'call': return Phone
    case 'email': return Mail
    case 'telegram': return MessageSquare
    default: return MessageSquare
  }
}

interface ItemCardProps {
  item: ExplorerItem
  compact?: boolean
  hideOwner?: boolean
}

export function ItemCard({ item, compact, hideOwner }: ItemCardProps) {
  const SourceIcon = getSourceIcon(item.source.type)

  return (
    <div className={`group bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:shadow-sm transition-all ${compact ? 'py-2' : ''}`}>
      {/* Line 1: Type badge + Content + Trust level */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0"><TypeBadge type={item.type} /></div>
          <span className="text-sm font-medium text-gray-900 leading-snug">{item.content}</span>
        </div>
        <div className="shrink-0"><TrustBadge level={item.trustLevel} /></div>
      </div>

      {/* Line 2: Owner/Target (optional) */}
      {!compact && !hideOwner && (item.ownerName || item.targetName) && (
        <div className="flex items-center gap-2 mb-2 ml-[calc(3rem+4px)] text-xs text-gray-500">
          {item.ownerName && <span className="font-medium text-gray-700">Owner: {item.ownerName}</span>}
          {item.ownerName && item.targetName && <span className="text-gray-300">&rarr;</span>}
          {item.targetName && <span className="font-medium text-gray-700">Target: {item.targetName}</span>}
        </div>
      )}

      {/* Line 3: Provenance quote */}
      {item.sourceQuote && (
        <div className={`text-xs text-gray-400 italic mb-2 ml-[calc(3rem+4px)] border-l-2 border-gray-100 pl-2 leading-relaxed ${compact ? 'line-clamp-1' : ''}`}>
          "{item.sourceQuote}"
        </div>
      )}

      {/* Line 4: Source attribution */}
      <div className="flex items-center gap-2 ml-[calc(3rem+4px)] text-[10px] font-bold text-gray-400 uppercase tracking-wide">
        <SourceIcon className="w-3 h-3" />
        <span>{item.source.type}</span>
        <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
        <span>{item.source.date}</span>
      </div>
    </div>
  )
}

export { TypeBadge, TrustBadge }
