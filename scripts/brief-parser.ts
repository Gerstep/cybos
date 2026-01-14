/**
 * Brief Parser - Converts morning brief markdown to structured JSON
 *
 * Usage:
 *   bun scripts/brief-parser.ts /content/briefs/0108-26.md
 *
 * Or import and use programmatically:
 *   import { parseBrief, BriefData } from './brief-parser'
 */

// ===== TYPE DEFINITIONS =====

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

// ===== PARSER IMPLEMENTATION =====

/**
 * Split markdown into sections by ## headers
 */
function splitSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')

  let currentSection = 'header'
  let currentContent: string[] = []

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }

      // Start new section
      currentSection = line.replace('## ', '').trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }

  return sections
}

/**
 * Parse the header to extract date
 */
function parseDate(header: string): string {
  // Look for "# Morning Brief - YYYY-MM-DD"
  const match = header.match(/Morning Brief - (\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]

  // Fallback: look for any date pattern
  const dateMatch = header.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) return dateMatch[1]

  return new Date().toISOString().split('T')[0]
}

/**
 * Parse generated timestamp
 */
function parseGeneratedAt(header: string): string {
  // Look for "Generated: YYYY-MM-DD HH:MM"
  const match = header.match(/Generated:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/)
  if (match) return match[1]

  return new Date().toISOString()
}

/**
 * Parse System Synthesis section
 */
function parseSynthesis(content: string | undefined): string {
  if (!content) return ''

  // Remove markdown formatting, keep plain text
  return content
    .replace(/^---\s*$/gm, '')
    .replace(/\*\*/g, '')
    .trim()
}

/**
 * Parse Priority Actions section
 */
function parsePriorities(content: string | undefined): PriorityItem[] {
  if (!content) return []

  const priorities: PriorityItem[] = []
  const blocks = content.split(/###\s+/).filter(Boolean)

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim()
    if (!block) continue

    const lines = block.split('\n')
    const title = lines[0].trim()

    let type: PriorityItem['type'] = 'review'
    let context = ''
    let action = ''

    for (const line of lines.slice(1)) {
      if (line.includes('**Why urgent:**') || line.includes('urgent')) {
        type = 'urgent'
        context = line.replace(/.*\*\*Why urgent:\*\*\s*/, '').trim()
      } else if (line.includes('blocking') || line.includes('Blocking')) {
        type = 'blocking'
        context = line.replace(/.*:\s*/, '').trim()
      } else if (line.includes('**Action:**') || line.includes('action')) {
        action = line.replace(/.*\*\*Action:\*\*\s*/, '').trim()
      } else if (line.startsWith('-') && !context) {
        context = line.replace(/^-\s*\*\*[^*]+\*\*\s*/, '').trim()
      }
    }

    priorities.push({
      id: `p${i + 1}`,
      title,
      type,
      context: context || 'Requires immediate attention',
      action: action || 'Review and address'
    })
  }

  return priorities
}

/**
 * Parse Today's Schedule section (markdown table)
 */
function parseSchedule(content: string | undefined): ScheduleItem[] {
  if (!content) return []

  const schedule: ScheduleItem[] = []
  const lines = content.split('\n').filter(line => line.includes('|'))

  // Skip header rows
  const dataRows = lines.filter(line => !line.includes('---') && !line.includes('Time'))

  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length < 2) continue

    const [time, title, attendeesStr, prep] = cols

    // Determine event type
    let type: ScheduleItem['type'] = 'meeting'
    if (title?.toLowerCase().includes('deep work') || title?.toLowerCase().includes('focus')) {
      type = 'deep-work'
    } else if (title?.toLowerCase().includes('call')) {
      type = 'call'
    }

    // Parse attendees
    const attendees = attendeesStr
      ? attendeesStr.split(/[,;]/).map(a => a.trim()).filter(Boolean)
      : []

    // Parse time to extract duration (if formatted as "09:00-10:00")
    let duration = '1h'
    const timeMatch = time?.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/)
    if (timeMatch) {
      const [_, start, end] = timeMatch
      const startMin = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1])
      const endMin = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1])
      const diffMin = endMin - startMin
      duration = diffMin >= 60 ? `${Math.floor(diffMin / 60)}h` : `${diffMin}m`
    }

    schedule.push({
      id: `s${i + 1}`,
      time: time?.split('-')[0]?.trim() || time || '',
      duration,
      title: title || '',
      attendees,
      type,
      prepContext: prep && prep !== '-' ? prep : undefined
    })
  }

  return schedule
}

/**
 * Parse Strategic Leverage section
 */
function parseLeverage(content: string | undefined): LeverageItem[] {
  if (!content) return []

  const leverage: LeverageItem[] = []
  const blocks = content.split(/###\s+/).filter(Boolean)

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim()
    if (!block) continue

    const lines = block.split('\n')
    const title = lines[0].trim()

    let score = '7.0'
    let problem = ''
    let impact = ''
    let source = ''
    let recommendedAction = ''

    for (const line of lines.slice(1)) {
      const cleanLine = line.replace(/^-\s*/, '').trim()

      if (cleanLine.startsWith('**Score:**')) {
        score = cleanLine.replace('**Score:**', '').trim()
      } else if (cleanLine.startsWith('**Problem:**')) {
        problem = cleanLine.replace('**Problem:**', '').trim()
      } else if (cleanLine.startsWith('**Impact:**')) {
        impact = cleanLine.replace('**Impact:**', '').trim()
      } else if (cleanLine.startsWith('**Source:**')) {
        source = cleanLine.replace('**Source:**', '').trim()
      } else if (cleanLine.startsWith('**Recommended action:**')) {
        recommendedAction = cleanLine.replace('**Recommended action:**', '').trim()
      }
    }

    leverage.push({
      id: `l${i + 1}`,
      title,
      score,
      problem: problem || 'Needs attention',
      impact: impact || 'Potential delay or missed opportunity',
      source: source || 'Morning brief analysis',
      recommendation: {
        task: recommendedAction || `Address ${title}`,
        quickAction: recommendedAction ? recommendedAction.split(' ').slice(0, 2).join(' ') : 'Review'
      }
    })
  }

  return leverage
}

/**
 * Parse Messages to Respond section
 */
function parseMessages(content: string | undefined): MessageItem[] {
  if (!content) return []

  const messages: MessageItem[] = []
  const blocks = content.split(/###\s+/).filter(Boolean)

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim()
    if (!block) continue

    const lines = block.split('\n')
    const headerLine = lines[0]

    // Parse sender and username from "Person Name (@username)"
    const senderMatch = headerLine.match(/^([^(@]+)(?:\s*\((@[\w]+)\))?/)
    const sender = senderMatch ? senderMatch[1].trim() : headerLine.trim()
    const username = senderMatch?.[2] || ''

    // Parse metadata lines
    let timestamp = ''
    let entitySlug = ''
    let dealSlug = ''
    let messageText = ''

    for (const line of lines.slice(1)) {
      if (line.includes('Last message:')) {
        const match = line.match(/Last message:\s*(\d{2}:\d{2})/)
        if (match) timestamp = match[1]
      } else if (line.includes('Entity:')) {
        const match = line.match(/Entity:\s*([^\s|]+)/)
        if (match) entitySlug = match[1]
        const dealMatch = line.match(/Deal:\s*([^\s]+)/)
        if (dealMatch) dealSlug = dealMatch[1]
      } else if (!line.startsWith('*') && !line.startsWith('---') && line.trim()) {
        messageText += line.trim() + ' '
      }
    }

    messages.push({
      id: `m${i + 1}`,
      platform: 'telegram',
      sender: `${sender}${username ? ` ${username}` : ''}`,
      text: messageText.trim() || 'Message content',
      context: entitySlug ? `Entity: ${entitySlug}` : undefined,
      timestamp: timestamp || 'Recent',
      entitySlug: entitySlug || undefined,
      dealSlug: dealSlug || undefined
    })
  }

  return messages
}

/**
 * Parse Email Highlights section (markdown table)
 */
function parseEmails(content: string | undefined): EmailItem[] {
  if (!content) return []

  const emails: EmailItem[] = []
  const lines = content.split('\n').filter(line => line.includes('|'))

  // Skip header rows
  const dataRows = lines.filter(line => !line.includes('---') && !line.includes('From'))

  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length < 2) continue

    const [sender, subject, date] = cols

    emails.push({
      id: `e${i + 1}`,
      sender: sender || '',
      subject: subject || '',
      snippet: '', // Brief format doesn't include snippets in table
      isImportant: sender?.toLowerCase().includes('important') || false,
      time: date || ''
    })
  }

  return emails
}

/**
 * Parse Tasks section
 */
function parseTasks(content: string | undefined): TaskItem[] {
  if (!content) return []

  const tasks: TaskItem[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Match "- [ ] Task" or "- [x] Task"
    const match = line.match(/^-\s*\[([ x])\]\s*(.+)$/)
    if (!match) continue

    const [_, checkbox, title] = match
    const isDone = checkbox === 'x'

    // Try to extract project from parentheses or brackets
    const projectMatch = title.match(/\(([^)]+)\)|\[([^\]]+)\]/)
    const project = projectMatch ? (projectMatch[1] || projectMatch[2]) : 'General'
    const cleanTitle = title.replace(/\s*\([^)]+\)\s*|\s*\[[^\]]+\]\s*/g, '').trim()

    // Infer priority from position (first items = high priority)
    let priority: TaskItem['priority'] = 'medium'
    if (i < 2) priority = 'high'
    else if (i > 5) priority = 'low'

    tasks.push({
      id: `t${i + 1}`,
      title: cleanTitle,
      project,
      status: isDone ? 'done' : 'todo',
      priority
    })
  }

  return tasks
}

/**
 * Parse Context Loaded section
 */
function parseContext(content: string | undefined): { entitiesReferenced: EntityRef[], recentCalls: CallRef[] } {
  const result = {
    entitiesReferenced: [] as EntityRef[],
    recentCalls: [] as CallRef[]
  }

  if (!content) return result

  const lines = content.split('\n')
  let section = ''

  for (const line of lines) {
    if (line.includes('Entities referenced')) {
      section = 'entities'
    } else if (line.includes('Recent calls')) {
      section = 'calls'
    } else if (line.startsWith('-') && section === 'entities') {
      // Parse "- person-name - context"
      const parts = line.replace(/^-\s*/, '').split(' - ')
      if (parts.length >= 1) {
        result.entitiesReferenced.push({
          name: parts[0].trim(),
          context: parts.slice(1).join(' - ').trim() || ''
        })
      }
    } else if (line.startsWith('-') && section === 'calls') {
      // Parse "- date - subject - person"
      const parts = line.replace(/^-\s*/, '').split(' - ')
      if (parts.length >= 1) {
        result.recentCalls.push({
          date: parts[0]?.trim() || '',
          subject: parts[1]?.trim() || '',
          person: parts[2]?.trim() || ''
        })
      }
    }
  }

  return result
}

/**
 * Parse Errors section
 */
function parseErrors(content: string | undefined): string[] {
  if (!content) return []

  const errors: string[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    if (line.startsWith('-')) {
      errors.push(line.replace(/^-\s*/, '').trim())
    }
  }

  return errors
}

// ===== MAIN PARSER FUNCTION =====

/**
 * Parse a morning brief markdown file into structured JSON
 */
export function parseBrief(markdown: string): BriefData {
  const sections = splitSections(markdown)

  return {
    date: parseDate(sections.header || ''),
    generatedAt: parseGeneratedAt(sections.header || ''),
    synthesis: parseSynthesis(sections['System Synthesis']),
    priorities: parsePriorities(sections['Priority Actions']),
    schedule: parseSchedule(sections["Today's Schedule"]),
    leverage: parseLeverage(sections['Strategic Leverage']),
    messages: parseMessages(sections['Messages to Respond']),
    emails: parseEmails(sections['Email Highlights']),
    tasks: parseTasks(sections['Tasks (from GTD)']),
    context: parseContext(sections['Context Loaded']),
    errors: parseErrors(sections['Errors'])
  }
}

// ===== CLI ENTRY POINT =====

if (import.meta.main) {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('Usage: bun scripts/brief-parser.ts <path-to-brief.md>')
    process.exit(1)
  }

  try {
    const file = Bun.file(filePath)
    const markdown = await file.text()
    const data = parseBrief(markdown)

    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error parsing brief: ${error}`)
    process.exit(1)
  }
}
