/**
 * Shared types for LLM extraction
 */

export interface ExtractedItem {
  type:
    | "promise"
    | "action_item"
    | "decision"
    | "question"
    | "metric"
    | "deal_mention";
  content: string;
  owner?: string; // Name of person responsible
  target?: string; // Name of person this item is about/for (v1.1)
  due_date?: string; // ISO date if mentioned
  status?: "pending" | "completed";
  confidence: number; // 0.5-1.0

  // v1.1: Provenance fields
  evidence_quote?: string; // Verbatim quote from source (10-50 words)
  line_range?: string; // Line numbers for calls (e.g., "245-247")
  timestamp?: string; // Message timestamp for telegram (e.g., "15:42")
}

export interface ExtractedEntity {
  name: string;
  type: "person" | "company" | "product";
  email?: string;
  telegram?: string;
  company?: string; // For persons: where they work
  role?: string; // For persons: their role
  building?: string; // What they're working on
  sector?: string; // For companies
  confidence: number; // 0.5-1.0
}

export interface ExtractionResult {
  items: ExtractedItem[];
  entities: ExtractedEntity[];
  summary?: string; // Brief summary if not already present
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseAliasList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

/**
 * User identity constants loaded from environment.
 */
export const USER_IDENTITY = (() => {
  const name = (process.env.CYBOS_USER_NAME || "").trim() || "User";
  const ownerValue =
    (process.env.CYBOS_USER_OWNER_NAME || "").trim() ||
    name.split(/\s+/)[0] ||
    name;
  const slug =
    (process.env.CYBOS_USER_SLUG || "").trim() || slugifyName(name) || "user";
  const aliases = parseAliasList(process.env.CYBOS_USER_ALIASES);
  const names = uniqueList(["Me", ownerValue, name, ...aliases]);

  return {
    slug,
    name,
    names,
    ownerValue,
  };
})();

/**
 * System prompt shared across all extraction types
 */
const userIdentityList = USER_IDENTITY.names.map((name) => `"${name}"`).join(", ");

export const SYSTEM_PROMPT = `You are an AI assistant that extracts structured information from conversations.

Your task is to identify:
1. **Promises**: Commitments someone made to do something
2. **Action Items**: Tasks that need to be completed
3. **Decisions**: Conclusions or agreements reached
4. **Questions**: Open questions that need answers
5. **Metrics**: Business numbers mentioned (ARR, users, funding, etc.)
6. **Deal Mentions**: References to companies/startups being discussed as deals

Also extract entities mentioned (EXCEPT the user - see below):
- **People**: Anyone mentioned by name (include company, role, what they're building if mentioned)
- **Companies**: Organizations, startups, funds
- **Products**: Specific products, projects, technologies

**CRITICAL RULES:**

1. **Evidence quotes are REQUIRED**: For every item, include the EXACT verbatim quote from the source (10-50 words).

2. **User identity**: ${userIdentityList} all refer to the USER of this system.
   - For items: Use "${USER_IDENTITY.ownerValue}" as owner/target when the user is involved
   - For entities: Do NOT create an entity for the user - skip ${userIdentityList}

3. **Do NOT invent names**: Only use names EXACTLY as they appear in the source.
   - If source says "Dima", use "Dima" - do NOT assume a last name
   - If source says "KP", use "KP" - do NOT expand to full name unless explicitly stated
   - Never combine partial information to guess a full name

4. **Do NOT extract generic labels as entities**: Skip "Speaker", "Unknown", "Participant", etc.

5. **Company/role attribution**: Only set company/role if EXPLICITLY stated in THIS conversation.
   - Do NOT assume company affiliations that aren't directly mentioned

Be conservative with confidence scores:
- 0.9-1.0: Explicitly stated, very clear, with exact quote
- 0.7-0.8: Implied or partially clear
- 0.5-0.6: Inferred, may need verification

Return valid JSON only. No markdown, no explanations.`;

/**
 * Response format shared across all extraction types
 */
export const RESPONSE_FORMAT = `{
  "items": [
    {
      "type": "promise|action_item|decision|question|metric|deal_mention",
      "content": "Description of the item",
      "owner": "Person name (if applicable)",
      "target": "Person this is about/for (if different from owner)",
      "evidence_quote": "EXACT verbatim quote from source (10-50 words) - REQUIRED",
      "line_range": "Line numbers (for calls, e.g., '245-247')",
      "timestamp": "Message time (for telegram, e.g., '15:42')",
      "due_date": "YYYY-MM-DD (if mentioned)",
      "status": "pending|completed",
      "confidence": 0.8
    }
  ],
  "entities": [
    {
      "name": "Full Name",
      "type": "person|company|product",
      "email": "email@example.com (if mentioned)",
      "telegram": "@handle (if mentioned)",
      "company": "Company name (for persons)",
      "role": "Their role (for persons)",
      "building": "What they're working on",
      "sector": "Sector (for companies)",
      "confidence": 0.8
    }
  ],
  "summary": "One sentence summary (optional, only if no summary exists)"
}`;
