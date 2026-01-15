// ===== BRIEF DATA TYPES =====

export interface BriefData {
  date: string
  generatedAt: string

  // Core sections
  synthesis: string
  priorities: PriorityItem[]
  schedule: ScheduleItem[]
  leverage: LeverageItem[]
  messages: MessageItem[]
  emails: EmailItem[]
  tasks: TaskItem[]

  // Metadata
  context: {
    entitiesReferenced: EntityRef[]
    recentCalls: CallRef[]
  }

  // Errors during generation
  errors: string[]

  // API metadata
  _meta?: {
    day: string
    formattedDate: string
    path: string
  }
}

export interface PriorityItem {
  id: string
  title: string
  type: 'urgent' | 'blocking' | 'review'
  context: string
  action: string
}

export interface ScheduleItem {
  id: string
  time: string
  duration: string
  title: string
  attendees: string[]
  type: 'meeting' | 'deep-work' | 'call'
  prepContext?: string
}

export interface LeverageItem {
  id: string
  title: string
  score: string
  problem: string
  impact: string
  source: string
  recommendation: {
    task: string
    quickAction: string
  }
}

export interface MessageItem {
  id: string
  platform: 'telegram' | 'email' | 'slack'
  sender: string
  avatar?: string
  text: string
  context?: string
  timestamp: string
  entitySlug?: string
  dealSlug?: string
}

export interface EmailItem {
  id: string
  sender: string
  subject: string
  snippet: string
  isImportant: boolean
  time: string
}

export interface TaskItem {
  id: string
  title: string
  project: string
  status: 'todo' | 'done'
  priority: 'high' | 'medium' | 'low'
}

export interface EntityRef {
  name: string
  context: string
}

export interface CallRef {
  date: string
  subject: string
  person: string
}

// ===== API RESPONSE TYPES =====

export interface BriefListResponse {
  briefs: {
    filename: string
    name: string
    formattedDate: string
  }[]
  total: number
}

export interface ApiError {
  error: string
  message?: string
  suggestion?: string
  path?: string
  day?: string
  formattedDate?: string
}

export type BriefResponse = BriefData | ApiError

export function isApiError(response: BriefResponse): response is ApiError {
  return 'error' in response
}

// ===== EXPLORER DATA TYPES =====

export interface ExplorerDashboard {
  timeRange: { start: string; end: string; days: number }
  deals: DealSummary[]
  entities: EntitySummary[]
  myCommitments: ExplorerItem[]
  metricsByCompany: MetricsByCompany[]
}

export interface DealSummary {
  slug: string
  name: string
  names: string[]  // All variant names (for fuzzy grouped)
  hasFolder: boolean
  lastActivity: string
  items: {
    metrics: ExplorerItem[]
    mentions: ExplorerItem[]
    decisions: ExplorerItem[]
  }
  introducedBy?: { name: string; slug: string }
}

export interface EntitySummary {
  slug: string
  name: string
  type: 'person' | 'company' | 'product' | 'group'
  email?: string
  telegram?: string
  interactionCount: number
  lastActivity: string
  isCandidate: boolean
  items: {
    promisesIMade: ExplorerItem[]
    promisesToMe: ExplorerItem[]
    actionItems: ExplorerItem[]
    decisions: ExplorerItem[]
    metrics: ExplorerItem[]
  }
}

export type ItemType = 'action_item' | 'promise' | 'decision' | 'metric' | 'question' | 'deal_mention'
export type SourceType = 'call' | 'email' | 'telegram'
export type TrustLevel = 'high' | 'medium' | 'low'
export type FilterType = 'all' | 'promise' | 'action_item' | 'decision' | 'metric'

export interface ExplorerItem {
  id: string
  type: ItemType
  content: string
  ownerName?: string
  ownerSlug?: string
  targetName?: string
  targetSlug?: string
  confidence: number
  trustLevel: TrustLevel
  sourceQuote: string
  source: {
    type: SourceType
    date: string
    id: string
  }
}

export interface MetricsByCompany {
  company: string
  companySlug?: string
  metrics: ExplorerItem[]
}

export type ExplorerResponse = ExplorerDashboard | ApiError

export function isExplorerError(response: ExplorerResponse): response is ApiError {
  return 'error' in response
}
