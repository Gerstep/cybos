/**
 * Call Extraction Prompt
 *
 * Extracts structured items and entities from call transcripts.
 */

import { SYSTEM_PROMPT, RESPONSE_FORMAT } from "./types";

export const CALL_SYSTEM_PROMPT = SYSTEM_PROMPT;

export function buildCallExtractionPrompt(
  title: string,
  date: string,
  attendees: string[],
  transcript: string,
  notes?: string
): string {
  const attendeeList = attendees.length > 0 ? attendees.join(", ") : "Unknown";

  let content = `## Call: ${title}
**Date:** ${date}
**Attendees:** ${attendeeList}

## Transcript
${transcript}`;

  if (notes) {
    content += `

## Notes
${notes}`;
  }

  return `Extract structured information from this call.

${content}

---

Focus on:
- Promises made by attendees ("I'll send you...", "We'll follow up...")
- Action items discussed ("Need to...", "Should...")
- Decisions reached ("We agreed...", "Decided to...")
- Open questions ("Need to figure out...", "Question about...")
- Metrics mentioned (revenue, users, funding amounts)
- If this is a deal/pitch call, note the company as a deal_mention

**CRITICAL REQUIREMENTS:**
1. For EVERY item, include the EXACT verbatim quote in "evidence_quote"
2. For EVERY item, include the line_range where it appears (e.g., "245" or "245-247")
3. Include both "owner" (who made the promise/action) AND "target" (who it's for)

For entities:
- Extract ALL people mentioned (attendees + anyone referenced)
- Extract companies being discussed or mentioned
- Note what people are building/working on if discussed

Return JSON in this format:
${RESPONSE_FORMAT}`;
}
