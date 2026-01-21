/**
 * Telegram Extraction Prompt
 *
 * Extracts structured items and entities from telegram conversations.
 */

import { SYSTEM_PROMPT, RESPONSE_FORMAT, USER_IDENTITY } from "./types";

export const TELEGRAM_SYSTEM_PROMPT = SYSTEM_PROMPT;

export function buildTelegramExtractionPrompt(
  contactName: string,
  username: string | undefined,
  conversationType: string,
  messages: string
): string {
  const handleInfo = username ? ` (@${username})` : "";
  const typeInfo =
    conversationType === "group" ? "group chat" : "private conversation";

  return `Extract structured information from this Telegram ${typeInfo}.

## Conversation with ${contactName}${handleInfo}

${messages}

---

Focus on:
- Promises made by either party ("I'll...", "Will send...")
- Action items ("Let's...", "Need to...", "Should...")
- Decisions or agreements ("Agreed", "Let's go with...", "Confirmed")
- Open questions or requests
- Metrics or numbers mentioned
- Deal/company references (startups being discussed)

**CRITICAL REQUIREMENTS:**
1. For EVERY item, include the EXACT verbatim quote in "evidence_quote" (keep it in original language, Russian or English)
2. For EVERY item, include the "timestamp" from the message (e.g., "15:42")
3. Include both "owner" (who said it) AND "target" (who it's for)
4. "Me" refers to ${USER_IDENTITY.name}

For entities:
- Extract the contact person (${contactName})
- Extract anyone else mentioned in the conversation
- Note their companies, roles, what they're building

Return JSON in this format:
${RESPONSE_FORMAT}`;
}
