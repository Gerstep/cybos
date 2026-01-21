/**
 * Email Extraction Prompt
 *
 * Extracts structured items and entities from email content.
 */

import { SYSTEM_PROMPT, RESPONSE_FORMAT } from "./types";

export const EMAIL_SYSTEM_PROMPT = SYSTEM_PROMPT;

export function buildEmailExtractionPrompt(
  subject: string,
  date: string,
  from: string,
  to: string[],
  body: string
): string {
  const recipients = to.join(", ");

  return `Extract structured information from this email.

## Email
**Subject:** ${subject}
**Date:** ${date}
**From:** ${from}
**To:** ${recipients}

## Body
${body}

---

Focus on:
- Promises made ("I'll send...", "Will follow up...")
- Action items ("Please...", "Need you to...", "Can you...")
- Decisions communicated ("We've decided...", "Going with...")
- Questions asked ("Can you confirm...", "What do you think...")
- Metrics or numbers mentioned
- Deal references (companies being discussed for investment)

**CRITICAL REQUIREMENTS:**
1. For EVERY item, include the EXACT verbatim quote in "evidence_quote"
2. Include both "owner" (who made the promise/action) AND "target" (who it's for)
3. Owner is typically the sender, target is typically a recipient

For entities:
- Extract sender and recipients as people
- Extract companies mentioned
- Note roles, companies, and what people are working on

Return JSON in this format:
${RESPONSE_FORMAT}`;
}
